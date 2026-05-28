"""Re-order English candidates by PA CSV order and try to match Chinese names"""
import re, csv

pa_csv = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\2015年英国大选各选区投票数据.csv'
data_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\constituencies-2015-real.ts'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'

# Read PA CSV to get constituency order
pa_cons_order = []
with open(pa_csv, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if row and row[0].strip():
            pa_cons_order.append(row[1].strip())
print(f"PA constituency order count: {len(pa_cons_order)}")

# Read TS data and parse it properly - extract all constituency blocks
with open(data_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract constituency blocks with their name and candidates
# The pattern: { id: X, name: 'Y', ..., candidates: [ { name: '...', party: '...' }, ... ] }
# Let's extract this by finding each constituency block

# A simpler approach: match each { id: ..., name: '...', ... candidates: [...] } block
# Then extract name and candidate names

# Extract constituency blocks using a simpler text scanning approach
cons_blocks = re.findall(r'\{\s*\n\s+id:\s*\d+.*?\}\s*,\s*\n\s*\n', content, re.DOTALL)
print(f"Found {len(cons_blocks)} constituency blocks")

# Build a map from constituency name -> [candidate names in order]
cons_to_cands = {}
for block in cons_blocks:
    # Get constituency name
    name_match = re.search(r'name:\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]', block)
    if not name_match:
        continue
    cons_name = name_match.group(1)
    # Get all candidate names
    cands = re.findall(r'name:\s*[\x27\x22]([^\x27\x22]+)[\x27\x22],\s*\n\s+party:\s*[\x27\x22]', block)
    cons_to_cands[cons_name] = cands

# Normalize constituency names for matching
def norm(s):
    s = s.replace(' & ', ' and ').replace('&', ' and ')
    s = s.replace(',', '').replace("'", '')
    s = re.sub(r'\s+', ' ', s).strip().lower()
    return ' '.join(sorted(s.split()))

# Build PA-order candidate list
pa_cands = []
unmatched_cons = []
for pa_name in pa_cons_order:
    nk = norm(pa_name)
    found = False
    for ts_name, cands in cons_to_cands.items():
        if norm(ts_name) == nk:
            pa_cands.extend(cands)
            found = True
            break
    if not found:
        unmatched_cons.append(pa_name)

print(f"PA-ordered candidate count: {len(pa_cands)}")
if unmatched_cons:
    print(f"Unmatched constituencies: {len(unmatched_cons)}")
    print(f"  First 5: {unmatched_cons[:5]}")

# Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    content = f.read()
zh_names = [l.strip() for l in content.split('\n') if l.strip() and not l.startswith('以下是')]
print(f"Chinese names: {len(zh_names)}")

# Check alignment
print("\nChecking known politicians in PA-ordered list:")
known = {
    'David Cameron': '戴维·卡梅伦', 'Ed Miliband': '埃德·米利班德',
    'Nick Clegg': '尼克·克莱格', 'Nigel Farage': '奈杰尔·法拉奇',
    'Boris Johnson': '鲍里斯·约翰逊', 'Theresa May': '特蕾莎·梅',
    'Jeremy Corbyn': '杰里米·科尔宾', 'John Bercow': '约翰·伯考',
}
for eng, expected in known.items():
    if eng in pa_cands:
        idx = pa_cands.index(eng)
        actual = zh_names[idx] if idx < len(zh_names) else 'N/A'
        status = "OK" if actual == expected else "MISMATCH"
        print(f"  [{status}] idx={idx:4d}  {eng:35s} -> expected={expected:20s} actual={actual}")

# Also print first 10 candidates
print("\nFirst 10 PA-ordered candidates:")
for i in range(min(10, len(pa_cands))):
    zh = zh_names[i] if i < len(zh_names) else 'N/A'
    print(f"  idx={i:4d}: EN={pa_cands[i]:35s} ZH={zh}")
