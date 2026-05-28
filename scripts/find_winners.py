"""Find all winning candidates and match with Chinese names"""
import csv, re

raw_csv = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\选举结果表.csv'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'
data_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\constituencies-2015-real.ts'

# Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    zh_names = [l.strip() for l in f.read().split('\n') if l.strip() and not l.startswith('以下是')]

# Find winners from raw CSV: they have 'MP' in Incumbent? column or highest votes per constituency
# Actually just extract all rows with name info, preserving raw order
raw_rows = []
with open(raw_csv, 'r', encoding='gbk') as f:
    reader = csv.DictReader(f)
    for row in reader:
        forename = row.get('Forename', '').strip()
        surname = row.get('Surname', '').strip()
        cons = row.get('Constituency Name', '').strip()
        incumbent = row.get('Incumbent?', '').strip()
        raw_rows.append({
            'name': f"{forename} {surname}".strip(),
            'cons': cons,
            'votes': int(row.get('Votes', '0').replace(',', '')),
            'incumbent': incumbent,
        })

# Group by constituency, find winner (top votes)
from collections import defaultdict
cons_groups = defaultdict(list)
for r in raw_rows:
    cons_groups[r['cons']].append(r)

winners = []
for cons, candidates in cons_groups.items():
    candidates.sort(key=lambda x: x['votes'], reverse=True)
    if candidates:
        winners.append(candidates[0]['name'])

print(f"Total winners: {len(winners)}")

# Get Chinese names for winners (by position in raw data)
# Build a mapping from raw CSV position to Chinese name
raw_eng = [r['name'] for r in raw_rows]

# Build a position map: for each raw name, record its position
# For duplicates, keep first occurrence position
name_to_first_pos = {}
for i, name in enumerate(raw_eng):
    if name not in name_to_first_pos:
        name_to_first_pos[name] = i

# Now map winner names to Chinese
winner_mappings = {}
unmatched_winners = []
for w in winners:
    # Find the Chinese name at the same position as this winner's first occurrence
    pos = name_to_first_pos[w]
    if pos < len(zh_names):
        winner_mappings[w] = zh_names[pos]
    else:
        unmatched_winners.append(w)

print(f"Winner name mappings: {len(winner_mappings)}")
if unmatched_winners:
    print(f"Unmatched winners: {len(unmatched_winners)}")

# Verify known winners
print("\nVerification:")
known_winners = ['David Cameron', 'Ed Miliband', 'Nick Clegg', 'Nigel Farage', 
                 'Boris Johnson', 'Jeremy Corbyn', 'John Bercow', 'Harriet Harman']
for w in known_winners:
    if w in winner_mappings:
        print(f"  {w:35s} -> {winner_mappings[w]}")
    elif w in name_to_first_pos:
        pos = name_to_first_pos[w]
        zh = zh_names[pos] if pos < len(zh_names) else 'N/A'
        print(f"  [RAW] {w:35s} pos={pos:4d} -> {zh}")
    else:
        print(f"  [N/A] {w}")
