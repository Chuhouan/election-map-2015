"""
Download UK constituency boundary GeoJSON files and merge with election data.
Outputs a single GeoJSON file with election result properties.
"""
import json
import urllib.request
import os
import re
import sys
import io
import math

# Fix Unicode output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

sys.path.insert(0, os.path.dirname(__file__))
from parse_election_data import parse_election_results, parse_electorate_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "lib", "data")

# Boundary GeoJSON URLs (martinjc/UK-GeoJSON - 2010 Westminster constituencies)
BOUNDARY_URLS = {
    "England": "https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/electoral/eng/wpc.json",
    "Scotland": "https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/electoral/sco/wpc.json",
    "Wales": "https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/electoral/wal/wpc.json",
    "Northern Ireland": "https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/electoral/ni/wpc.json",
}

# ============================================================
# Douglas-Peucker simplification (pure Python)
# ============================================================
def perpendicular_distance(point, line_start, line_end):
    """Calculate perpendicular distance from point to line segment."""
    x, y = point
    x1, y1 = line_start
    x2, y2 = line_end
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return math.sqrt((x - x1) ** 2 + (y - y1) ** 2)
    t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
    if t < 0:
        return math.sqrt((x - x1) ** 2 + (y - y1) ** 2)
    if t > 1:
        return math.sqrt((x - x2) ** 2 + (y - y2) ** 2)
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    return math.sqrt((x - proj_x) ** 2 + (y - proj_y) ** 2)


def douglas_peucker(points, epsilon):
    """Simplify a polyline using the Douglas-Peucker algorithm."""
    if len(points) <= 2:
        return points[:]
    
    # Find the point with the maximum distance
    dmax = 0
    index = 0
    end = len(points) - 1
    
    for i in range(1, end):
        d = perpendicular_distance(points[i], points[0], points[end])
        if d > dmax:
            index = i
            dmax = d
    
    if dmax > epsilon:
        rec1 = douglas_peucker(points[:index + 1], epsilon)
        rec2 = douglas_peucker(points[index:], epsilon)
        return rec1[:-1] + rec2
    else:
        return [points[0], points[end]]


def simplify_ring(coords, epsilon=0.0003):
    """Simplify a linear ring (closed polygon ring). Keep at least 4 points."""
    if len(coords) <= 4:
        return coords[:]
    simplified = douglas_peucker(coords, epsilon)
    if len(simplified) < 4:
        return coords[:4]
    return simplified


def simplify_geometry(geom, epsilon=0.0003):
    """Simplify a GeoJSON geometry (Polygon or MultiPolygon)."""
    if geom["type"] == "Polygon":
        return {
            "type": "Polygon",
            "coordinates": [simplify_ring(c, epsilon) for c in geom["coordinates"]],
        }
    elif geom["type"] == "MultiPolygon":
        return {
            "type": "MultiPolygon",
            "coordinates": [
                [simplify_ring(c, epsilon) for c in polygon]
                for polygon in geom["coordinates"]
            ],
        }
    return geom


def count_coords(geom):
    """Count total coordinates in a geometry."""
    if geom["type"] == "Polygon":
        return sum(len(ring) for ring in geom["coordinates"])
    elif geom["type"] == "MultiPolygon":
        return sum(
            sum(len(ring) for ring in polygon)
            for polygon in geom["coordinates"]
        )
    return 0


def download_boundaries():
    """Download all 4 regional GeoJSON files."""
    boundaries = {}
    for nation, url in BOUNDARY_URLS.items():
        print(f"  Downloading {nation} boundaries...")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                boundaries[nation] = data
                print(f"    OK {nation}: {len(data['features'])} features")
        except Exception as e:
            print(f"    FAIL {nation}: {e}")
    return boundaries


def normalize_name(name):
    """Normalize constituency name for matching."""
    if not name:
        return ""
    n = name.strip()
    # Remove commas
    n = n.replace(",", "")
    # Normalize spaces
    n = re.sub(r"\s+", " ", n)
    # Common variations
    n = n.replace(" & ", " and ")
    # Handle special cases
    replacements = {
        "St.": "St",
        "St ": "Saint ",
        "Co ": "County ",
    }
    for old, new in replacements.items():
        n = n.replace(old, new)
    return n.lower().strip()


def match_constituencies(boundaries, constituencies):
    """Match boundary features to election data by name."""
    # Build lookup from election data
    elec_names = {normalize_name(c["name"]): c for c in constituencies.values()}
    
    matched = []
    unmatched_boundaries = []
    unmatched_election = set(elec_names.keys())
    
    for nation, geojson in boundaries.items():
        for feature in geojson["features"]:
            props = feature["properties"]
            bname = props.get("PCON13NM", "")
            bname_norm = normalize_name(bname)
            
            # Exact match
            if bname_norm in elec_names:
                matched.append((feature, elec_names[bname_norm], nation))
                unmatched_election.discard(bname_norm)
                continue
            
            # Try fuzzy matching - check if one contains the other
            found = False
            for ename in list(unmatched_election):
                if bname_norm in ename or ename in bname_norm:
                    matched.append((feature, elec_names[ename], nation))
                    unmatched_election.discard(ename)
                    found = True
                    break
            
            if not found:
                unmatched_boundaries.append(f"{nation}: {bname}")
    
    return matched, unmatched_boundaries, list(unmatched_election)


def merge_geojson(matched, constituencies, electorate_data, epsilon=0.0003):
    """Create merged GeoJSON with election properties and simplified geometries."""
    features = []
    total_coords_before = 0
    total_coords_after = 0
    
    for feature, elec, nation in matched:
        # Simplify geometry first
        original_coords = count_coords(feature["geometry"])
        total_coords_before += original_coords
        simplified_geom = simplify_geometry(feature["geometry"], epsilon)
        after_coords = count_coords(simplified_geom)
        total_coords_after += after_coords
        # Calculate election properties
        candidates = sorted(elec["candidates"], key=lambda x: x["votes"], reverse=True)
        if len(candidates) >= 2:
            majority = candidates[0]["votes"] - candidates[1]["votes"]
        else:
            majority = candidates[0]["votes"] if candidates else 0
        
        # Get electorate data
        name = elec["name"]
        elec_info = electorate_data.get(name, {"electorate": 0, "valid_votes": 0})
        electorate = elec_info.get("electorate", 0)
        total_votes = elec.get("total_votes", 0)
        
        if electorate > 0 and total_votes > 0:
            turnout = round(total_votes / electorate * 100, 1)
        else:
            turnout = 65.0
        
        # Find winner's vote share
        winner_cand = [c for c in candidates if c.get("is_winner")]
        if not winner_cand:
            winner_cand = [candidates[0]] if candidates else []
        vote_share = winner_cand[0]["share"] if winner_cand else 0
        
        # Build merged feature (use simplified geometry)
        new_feature = {
            "type": "Feature",
            "geometry": simplified_geom,
            "properties": {
                "name": elec["name"],
                "boundaryName": feature["properties"].get("PCON13NM", ""),
                "code": feature["properties"].get("PCON13CD", ""),
                "region": elec.get("region", ""),
                "county": elec.get("county", ""),
                "nation": elec.get("country", ""),
                "party": elec.get("winner", "Unknown"),
                "majority": majority,
                "turnout": turnout,
                "electorate": electorate,
                "totalVotes": total_votes,
                "voteShare": vote_share,
                "swing": 0,
                "candidates": [
                    {
                        "name": c["name"],
                        "party": c["party"],
                        "votes": c["votes"],
                        "voteShare": c["share"],
                        "isWinner": c.get("is_winner", False),
                        "wasIncumbent": c.get("was_incumbent", False),
                    }
                    for c in candidates[:8]  # Keep top 8 candidates
                ],
            },
        }
        features.append(new_feature)
    
    return {
        "type": "FeatureCollection",
        "features": features,
    }, total_coords_before, total_coords_after


def main():
    print("=" * 60)
    print("UK Boundary GeoJSON Builder")
    print("=" * 60)
    
    # Parse election data
    print("\n[1/3] Parsing election data...")
    constituencies = parse_election_results()
    electorate_data = parse_electorate_data()
    print(f"  Constituencies: {len(constituencies)}")
    print(f"  Electorate records: {len(electorate_data)}")
    
    # Download boundaries
    print("\n[2/3] Downloading boundary GeoJSON files...")
    boundaries = download_boundaries()
    if not boundaries:
        print("ERROR: No boundary data downloaded!")
        return
    
    # Match
    print("\n[3/3] Matching boundaries with election data...")
    matched, unmatched_b, unmatched_e = match_constituencies(boundaries, constituencies)
    
    print(f"\n  Matched: {len(matched)} / {len(constituencies)}")
    print(f"  Unmatched boundaries: {len(unmatched_b)}")
    print(f"  Unmatched election: {len(unmatched_e)}")
    
    if unmatched_e:
        print("\n  Unmatched election constituencies:")
        for name in sorted(unmatched_e)[:20]:
            print(f"    - {name}")
        if len(unmatched_e) > 20:
            print(f"    ... and {len(unmatched_e) - 20} more")
    
    if unmatched_b:
        print("\n  Unmatched boundary features:")
        for name in sorted(unmatched_b)[:10]:
            print(f"    - {name}")
        if len(unmatched_b) > 10:
            print(f"    ... and {len(unmatched_b) - 10} more")
    
    # Merge and save (with geometry simplification)
    SIMPLIFY_EPSILON = 0.001  # ~100m tolerance for web-optimized size
    merged, coords_before, coords_after = merge_geojson(matched, constituencies, electorate_data, epsilon=SIMPLIFY_EPSILON)
    
    output_path = os.path.join(BASE_DIR, "public", "data", "constituency-boundaries-merged.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(merged, f)
    
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\n  Output: {output_path}")
    print(f"  File size: {file_size_mb:.2f} MB")
    print(f"  Features: {len(merged['features'])}")
    if coords_before > 0:
        reduction = (1 - coords_after / coords_before) * 100
        print(f"  Coordinates: {coords_before:,} -> {coords_after:,} ({reduction:.1f}% reduction)")
    
    # Party summary
    party_counts = {}
    for f in merged["features"]:
        p = f["properties"]["party"]
        party_counts[p] = party_counts.get(p, 0) + 1
    
    print("\n  Party seats in merged data:")
    for p, n in sorted(party_counts.items(), key=lambda x: -x[1]):
        print(f"    {p}: {n}")
    
    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
