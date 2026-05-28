"""
Complete 2015 UK Election data processor.
Parses CSV election results and generates TypeScript data with coordinates.
"""
import csv
import json
import re
import os
import random

random.seed(42)

BASE_DIR = r"c:/Users/63259/CodeBuddy/20260528014453"
DATA_DIR = os.path.join(BASE_DIR, "lib", "data")

REGION_CENTROIDS = {
    'East Midlands':        {'lng': -1.0, 'lat': 53.0, 'slng': 1.5, 'slat': 1.3},
    'Eastern':              {'lng':  0.4, 'lat': 52.2, 'slng': 1.6, 'slat': 1.2},
    'London':               {'lng': -0.15,'lat': 51.51,'slng': 0.35,'slat': 0.15},
    'North East':           {'lng': -1.55,'lat': 54.85,'slng': 0.95,'slat': 0.7},
    'North West':           {'lng': -2.5, 'lat': 53.8, 'slng': 1.8, 'slat': 1.5},
    'South East':           {'lng':  0.0, 'lat': 51.2, 'slng': 1.8, 'slat': 1.3},
    'South West':           {'lng': -3.5, 'lat': 50.8, 'slng': 2.5, 'slat': 1.5},
    'West Midlands':        {'lng': -2.0, 'lat': 52.5, 'slng': 1.5, 'slat': 1.2},
    'Yorkshire and The Humber': {'lng': -1.2,'lat': 53.8,'slng': 1.5, 'slat': 1.3},
    'Scotland':             {'lng': -4.0, 'lat': 56.5, 'slng': 3.0, 'slat': 3.0},
    'Wales':                {'lng': -3.8, 'lat': 52.3, 'slng': 2.0, 'slat': 1.5},
    'Northern Ireland':     {'lng': -6.5, 'lat': 54.6, 'slng': 1.8, 'slat': 1.3},
}

# Comprehensive party abbreviation mapping
PARTY_ABBR_MAP = {
    'Con': 'Conservative', 'Lab': 'Labour', 'LD': 'Liberal Democrat',
    'UKIP': 'UKIP', 'Green': 'Green Party', 'SNP': 'SNP',
    'PC': 'Plaid Cymru', 'DUP': 'DUP', 'SF': 'Sinn Fein',
    'SDLP': 'SDLP', 'UUP': 'UUP', 'APNI': 'Alliance',
    'TUV': 'TUV', 'Spk': 'Speaker', 'Ind': 'Independent',
    'Respect': 'Respect', 'TUSC': 'TUSC', 'BNP': 'BNP',
    'English Democrat': 'English Democrats', 'CPA': 'CPA',
    'Soc Lab': 'Socialist Labour', 'Comm': 'Communist',
    'NF': 'National Front', 'WP': 'Workers Party',
    'Yorks': 'Yorkshire First', 'NHAP': 'NHAP',
    'CISTA': 'CISTA', 'Pirate': 'Pirate',
    'Monster': 'Monster Raving Loony',
    'Wessex Reg': 'Wessex Regionalist',
    'Alliance': 'Alliance',
    'Christian': 'Christian',
    'SPGB': 'SPGB',
    'SEP': 'SEP',
    'SSP': 'SSP',
    'TUSC': 'TUSC',
    'TUV': 'TUV',
    'UUP': 'UUP',
    'Vapers': 'Vapers',
}

def parse_election_results():
    """Parse election results CSV. Winner = candidate with highest votes."""
    constituencies = {}
    csv_path = os.path.join(DATA_DIR, "选举结果表.csv")
    
    with open(csv_path, 'r', encoding='gbk') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('Constituency Name', '').strip()
            if not name:
                continue
            
            if name not in constituencies:
                constituencies[name] = {
                    'name': name,
                    'constituency_id': row.get('Constituency ID ', '').strip(),
                    'region': row.get('Region ', '').strip(),
                    'county': row.get('County ', '').strip(),
                    'country': row.get('Country ', '').strip(),
                    'type': row.get('Constituency type', '').strip(),
                    'pano': row.get('PANO', '').strip(),
                    'candidates': [],
                    'total_votes': 0,
                }
            
            c = constituencies[name]
            forename = row.get('Forename', '').strip()
            surname = row.get('Surname', '').strip()
            desc = row.get('Description on ballot paper', '').strip()
            abbr = row.get('Party abbreviation', '').strip()
            votes_str = row.get('Votes', '0').replace(',', '')
            share_str = row.get('Share (%)', '0')
            incumbent = row.get('Incumbent?', '').strip()
            
            try:
                votes = int(votes_str)
            except:
                votes = 0
            try:
                share = float(share_str)
            except:
                share = 0.0
            
            # Map party abbreviation to display name
            party = PARTY_ABBR_MAP.get(abbr, None)
            if party is None:
                # Fallback: infer from description
                descU = desc.upper()
                if 'CONSERVATIVE' in descU: party = 'Conservative'
                elif 'LABOUR PARTY' in descU or 'SCOTTISH LABOUR' in descU or 'WELSH LABOUR' in descU: party = 'Labour'
                elif 'LABOUR AND CO' in descU: party = 'Labour'
                elif 'LIBERAL DEMOCRAT' in descU: party = 'Liberal Democrat'
                elif 'UKIP' in descU or 'UK INDEPENDENCE' in descU: party = 'UKIP'
                elif 'GREEN PARTY' in descU: party = 'Green Party'
                elif 'SCOTTISH NATIONAL' in descU or descU.startswith('SNP'): party = 'SNP'
                elif 'PLAID CYMRU' in descU: party = 'Plaid Cymru'
                elif 'DUP' in descU or 'DEMOCRATIC UNIONIST' in descU: party = 'DUP'
                elif 'SINN F' in descU: party = 'Sinn Fein'
                elif 'SDLP' in descU: party = 'SDLP'
                elif 'ULSTER UNIONIST' in descU or descU == 'UUP': party = 'UUP'
                elif 'ALLIANCE' in descU: party = 'Alliance'
                elif 'TUV' in descU or 'TRADITIONAL UNIONIST' in descU: party = 'TUV'
                elif 'INDEPENDENT' in descU: party = 'Independent'
                elif 'SPEAKER' in descU: party = 'Speaker'
                elif 'RESPECT' in descU: party = 'Respect'
                elif 'BNP' in descU or 'BRITISH NATIONAL' in descU: party = 'BNP'
                elif 'ENGLISH DEMOCRAT' in descU or 'ENG DEM' in descU: party = 'English Democrats'
                elif 'CHRISTIAN' in descU: party = 'Christian'
                elif 'MONSTER' in descU: party = 'Monster Raving Loony'
                elif 'COMMUNIST' in descU: party = 'Communist'
                elif 'PIRATE' in descU: party = 'Pirate'
                elif 'SOCIALIST LABOUR' in descU: party = 'Socialist Labour'
                elif 'TRADE UNIONIST' in descU or 'TUSC' in descU: party = 'TUSC'
                elif 'WORKERS' in descU: party = 'Workers Party'
                elif 'YORKSHIRE' in descU: party = 'Yorkshire First'
                elif 'NATIONAL FRONT' in descU: party = 'National Front'
                elif 'WESSEX' in descU: party = 'Wessex Regionalist'
                elif 'OFFICIAL MONSTER' in descU: party = 'Monster Raving Loony'
                elif 'VAPERS' in descU: party = 'Vapers'
                elif 'PIRATE' in descU: party = 'Pirate'
                else:
                    party = desc if desc else (abbr or 'Other')
            
            candidate = {
                'name': f"{forename} {surname}".strip(),
                'party': party,
                'party_abbr': abbr,
                'party_desc': desc,
                'votes': votes,
                'share': share,
                'was_incumbent': (incumbent == 'MP'),
            }
            
            c['candidates'].append(candidate)
            c['total_votes'] += votes
    
    # Determine winners: highest votes wins
    for name, c in constituencies.items():
        if c['candidates']:
            sorted_cands = sorted(c['candidates'], key=lambda x: x['votes'], reverse=True)
            c['winner'] = sorted_cands[0]['party']
            c['winner_votes'] = sorted_cands[0]['votes']
            # Mark the actual winner
            sorted_cands[0]['is_winner'] = True
    
    return constituencies


def parse_electorate_data():
    """Parse electorate/turnout CSV (multi-row header format)."""
    csv_path = os.path.join(DATA_DIR, "2015年大选投票数据-关键统计.csv")
    data = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        
        # Skip row 1 (category labels) and row 2 (column names)
        next(reader)  # Row 1: TURNOUT, REJECTED BALLOTS, etc.
        headers = next(reader)  # Row 2: actual column names
        next(reader)  # Row 3: empty row
        
        # Map headers
        name_idx = 0  # Col 0 is 'Constituency Name 2015'
        electorate_idx = 7  # Col 7 is 'Electorate '
        valid_votes_idx = 8  # Col 8 is 'Total number of valid votes counted'
        
        for row in reader:
            if len(row) <= max(name_idx, electorate_idx, valid_votes_idx):
                continue
            
            name = row[name_idx].strip().replace('"', '')
            if not name:
                continue
            
            electorate_str = row[electorate_idx].strip().replace(',', '').replace('"', '')
            valid_str = row[valid_votes_idx].strip().replace(',', '').replace('"', '')
            
            try:
                electorate = int(electorate_str) if electorate_str else 0
            except:
                electorate = 0
            
            try:
                valid_votes = int(valid_str) if valid_str else 0
            except:
                valid_votes = 0
            
            if electorate > 0:
                data[name] = {'electorate': electorate, 'valid_votes': valid_votes}
    
    return data


def assign_coordinates(constituencies):
    """Assign coordinates based on region."""
    for name, c in constituencies.items():
        region = c['region']
        centroid = REGION_CENTROIDS.get(region)
        
        if not centroid:
            for key in REGION_CENTROIDS:
                if key.lower() in region.lower() or region.lower() in key.lower():
                    centroid = REGION_CENTROIDS[key]
                    break
        
        if not centroid:
            c['lat'] = round(54.0 + random.uniform(-3, 3), 3)
            c['lng'] = round(-3.0 + random.uniform(-5, 5), 3)
        else:
            c['lat'] = round(centroid['lat'] + random.uniform(-1, 1) * centroid['slat'], 3)
            c['lng'] = round(centroid['lng'] + random.uniform(-1, 1) * centroid['slng'], 3)


def generate_ts_file(constituencies, electorate_data):
    """Generate TypeScript file."""
    
    # Merge electorate data
    matched = 0
    for name, c in constituencies.items():
        if name in electorate_data:
            c['electorate'] = electorate_data[name]['electorate']
            matched += 1
        else:
            c['electorate'] = 0
    
    # Calculate turnout
    for name, c in constituencies.items():
        if c['electorate'] > 0 and c['total_votes'] > 0:
            c['turnout'] = round(c['total_votes'] / c['electorate'] * 100, 1)
        else:
            c['turnout'] = 65.0
    
    # Sort by region then name
    sorted_items = sorted(constituencies.items(), key=lambda x: (x[1]['region'], x[0]))
    
    lines = []
    lines.append("// ============================================================")
    lines.append("// 2015 年英国大选真实选举数据 (650 选区)")
    lines.append("// 数据来源: 选举结果表.csv + 2015年大选投票数据-关键统计.csv")
    lines.append("// 生成时间: 2025-05-28")
    lines.append("// ============================================================")
    lines.append("")
    lines.append("export interface ElectionResult2015 {")
    lines.append("  party: string")
    lines.append("  voteShare: number")
    lines.append("  majority: number")
    lines.append("  turnout: number")
    lines.append("}")
    lines.append("")
    lines.append("export interface Candidate2015 {")
    lines.append("  name: string")
    lines.append("  party: string")
    lines.append("  votes: number")
    lines.append("  voteShare: number")
    lines.append("  isWinner: boolean")
    lines.append("  wasIncumbent: boolean")
    lines.append("}")
    lines.append("")
    lines.append("export interface Constituency2015 {")
    lines.append("  id: number")
    lines.append("  name: string")
    lines.append("  region: string")
    lines.append("  county: string")
    lines.append("  nation: string")
    lines.append("  lat: number")
    lines.append("  lng: number")
    lines.append("  electorate: number")
    lines.append("  totalVotes: number")
    lines.append("  winner: string")
    lines.append("  majority: number")
    lines.append("  turnout: number")
    lines.append("  candidates: Candidate2015[]")
    lines.append("}")
    lines.append("")
    lines.append("// Party colors (BBC standard)")
    lines.append("export const PARTY_COLORS_2015: Record<string, string> = {")
    lines.append("  'Conservative': '#0087DC',")
    lines.append("  'Labour': '#DC241F',")
    lines.append("  'Liberal Democrat': '#FAA61A',")
    lines.append("  'SNP': '#FFFF00',")
    lines.append("  'Green Party': '#6AB023',")
    lines.append("  'UKIP': '#70147A',")
    lines.append("  'Plaid Cymru': '#3F8428',")
    lines.append("  'DUP': '#D46A4C',")
    lines.append("  'Sinn Fein': '#328328',")
    lines.append("  'SDLP': '#2AA82C',")
    lines.append("  'UUP': '#48A5EE',")
    lines.append("  'Alliance': '#F6CB2F',")
    lines.append("  'TUV': '#0C3B73',")
    lines.append("  'Speaker': '#808080',")
    lines.append("  'Independent': '#C0C0C0',")
    lines.append("};")
    lines.append("")
    lines.append("const constituencyData: Constituency2015[] = [")
    
    for idx, (name, c) in enumerate(sorted_items):
        candidates = sorted(c['candidates'], key=lambda x: x['votes'], reverse=True)
        
        if len(candidates) >= 2:
            majority = candidates[0]['votes'] - candidates[1]['votes']
        else:
            majority = candidates[0]['votes'] if candidates else 0
        
        winner = c['winner']
        
        safe_name = name.replace("\\", "\\\\").replace("'", "\\'")
        
        lines.append("  {")
        lines.append(f"    id: {idx + 1},")
        lines.append(f"    name: '{safe_name}',")
        lines.append(f"    region: '{c['region']}',")
        lines.append(f"    county: '{c['county']}',")
        lines.append(f"    nation: '{c['country']}',")
        lines.append(f"    lat: {c['lat']},")
        lines.append(f"    lng: {c['lng']},")
        lines.append(f"    electorate: {c['electorate']},")
        lines.append(f"    totalVotes: {c['total_votes']},")
        lines.append(f"    winner: '{winner}',")
        lines.append(f"    majority: {majority},")
        lines.append(f"    turnout: {c['turnout']},")
        lines.append("    candidates: [")
        
        for cand in candidates:
            safe_cname = cand['name'].replace("\\", "\\\\").replace("'", "\\'")
            safe_party = cand['party'].replace("\\", "\\\\").replace("'", "\\'")
            lines.append("      {")
            lines.append(f"        name: '{safe_cname}',")
            lines.append(f"        party: '{safe_party}',")
            lines.append(f"        votes: {cand['votes']},")
            lines.append(f"        voteShare: {cand['share']},")
            lines.append(f"        isWinner: {str(cand.get('is_winner', False)).lower()},")
            lines.append(f"        wasIncumbent: {str(cand.get('was_incumbent', False)).lower()},")
            lines.append("      },")
        
        lines.append("    ],")
        lines.append("  },")
    
    lines.append("];")
    lines.append("")
    lines.append("export default constituencyData;")
    lines.append("")
    
    # Add summary stats
    party_seats = {}
    total_votes = 0
    total_electorate = 0
    for name, c in constituencies.items():
        w = c.get('winner')
        if w:
            party_seats[w] = party_seats.get(w, 0) + 1
        total_votes += c['total_votes']
        total_electorate += c.get('electorate', 0)
    
    lines.append("export function getElectoralSummary2015() {")
    lines.append("  return {")
    lines.append(f"    totalConstituencies: {len(constituencies)},")
    lines.append(f"    totalVotes: {total_votes},")
    lines.append(f"    totalElectorate: {total_electorate},")
    if total_electorate > 0:
        lines.append(f"    nationalTurnout: {round(total_votes/total_electorate*100, 1)},")
    lines.append(f"    partySeats: {json.dumps(party_seats)},")
    lines.append("  };")
    lines.append("}")
    
    return "\n".join(lines), matched


def main():
    print("=" * 60)
    print("2015 UK General Election Data Processor v2")
    print("=" * 60)
    
    print("\n[1/4] Parsing election results from CSV...")
    constituencies = parse_election_results()
    print(f"  Parsed {len(constituencies)} constituencies, {sum(len(c['candidates']) for c in constituencies.values())} candidates")
    
    # Winner summary (by highest votes)
    party_seats = {}
    for name, c in constituencies.items():
        w = c.get('winner')
        if w:
            party_seats[w] = party_seats.get(w, 0) + 1
    
    print("\n  Final 2015 seat count (by highest votes):")
    for p, n in sorted(party_seats.items(), key=lambda x: -x[1]):
        print(f"    {p}: {n}")
    
    # Check expected vs actual
    print("\n  Comparison with Historical Results:")
    expected = {
        'Conservative': 330, 'Labour': 232, 'SNP': 56, 'Liberal Democrat': 8,
        'DUP': 8, 'Sinn Fein': 4, 'Plaid Cymru': 3, 'SDLP': 3,
        'UUP': 2, 'UKIP': 1, 'Green Party': 1, 'Independent': 1, 'Speaker': 1
    }
    for p, exp in expected.items():
        actual = party_seats.get(p, 0)
        diff = actual - exp
        marker = ' OK' if diff == 0 else f' (diff: {diff:+d})'
        print(f"    {p}: expected={exp}, actual={actual}{marker}")
    
    print("\n[2/4] Parsing electorate/turnout data...")
    electorate_data = parse_electorate_data()
    print(f"  Parsed {len(electorate_data)} constituencies with electorate data")
    
    print("\n[3/4] Assigning coordinates by region...")
    assign_coordinates(constituencies)
    
    # Region distribution
    regions = {}
    for c in constituencies.values():
        r = c['region']
        regions[r] = regions.get(r, 0) + 1
    for r, n in sorted(regions.items(), key=lambda x: -x[1]):
        print(f"  {r}: {n}")
    
    print("\n[4/4] Generating TypeScript file...")
    ts_code, matched = generate_ts_file(constituencies, electorate_data)
    
    output_path = os.path.join(DATA_DIR, "constituencies-2015-real.ts")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"\n  Written to: {output_path}")
    print(f"  File size: {os.path.getsize(output_path):,} bytes")
    print(f"  Electorate data matched: {matched}/{len(constituencies)}")
    
    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)


if __name__ == '__main__':
    main()
