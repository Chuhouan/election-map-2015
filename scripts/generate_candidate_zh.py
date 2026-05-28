"""Generate candidate Chinese name mapping using the raw election results CSV"""
import csv, re

raw_csv = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\选举结果表.csv'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'
data_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\constituencies-2015-real.ts'
out_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\candidate-name-zh.ts'

# 1. Read raw election data to get English names in order
raw_eng_names = []
with open(raw_csv, 'r', encoding='gbk') as f:
    reader = csv.DictReader(f)
    for row in reader:
        forename = row.get('Forename', '').strip()
        surname = row.get('Surname', '').strip()
        if forename or surname:
            full_name = f"{forename} {surname}".strip()
            raw_eng_names.append(full_name)

print(f"Raw English names: {len(raw_eng_names)}")

# 2. Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    content = f.read()
zh_names = [l.strip() for l in content.split('\n') if l.strip() and not l.startswith('以下是')]
print(f"Chinese names: {len(zh_names)}")

# 3. Build mapping by position
map_size = min(len(raw_eng_names), len(zh_names))
print(f"Building {map_size} mappings...")

# Verify a few
print("\nVerification (first 12):")
for i in range(12):
    if i < map_size:
        match = "✓" if raw_eng_names[i] in [v for v in []] else ""
        print(f"  {raw_eng_names[i]:40s} -> {zh_names[i]}")

print("\nKnown politicians check:")
known = {
    'David Cameron': '戴维·卡梅伦', 'Ed Miliband': '埃德·米利班德',
    'Nick Clegg': '尼克·克莱格', 'Nigel Farage': '奈杰尔·法拉奇',
    'Boris Johnson': '鲍里斯·约翰逊', 'Theresa May': '特蕾莎·梅',
    'Jeremy Corbyn': '杰里米·科尔宾', 'John Bercow': '约翰·伯考',
    'Sadiq Khan': '萨迪克·汗', 'Michael Gove': '迈克尔·戈夫',
    'Harriet Harman': '哈里特·哈曼', 'Diane Abbott': '黛安·阿博特',
}
for eng, expected in known.items():
    if eng in raw_eng_names:
        idx = raw_eng_names.index(eng)
        actual = zh_names[idx] if idx < len(zh_names) else 'N/A'
        status = "OK" if actual == expected else "MISMATCH"
        print(f"  [{status}] index={idx:4d}  {eng:35s} -> expected={expected:20s} actual={actual}")
    else:
        print(f"  [NOT FOUND] {eng}")

# 4. Build TS file
# First, deduplicate - some names appear multiple times in raw data (same candidate for multiple constituencies)
# We'll create a unique map
raw_to_zh = {}
for i in range(map_size):
    eng = raw_eng_names[i]
    zh = zh_names[i]
    if eng not in raw_to_zh:
        raw_to_zh[eng] = zh

# Now cross-reference with TS data names
# Read TS data candidate names
with open(data_path, 'r', encoding='utf-8') as f:
    content = f.read()
ts_cand_pattern = r'name:\s*[\x27\x22]([^\x27\x22]+)[\x27\x22],\s*\n\s+party:\s*[\x27\x22]'
ts_eng_names = re.findall(ts_cand_pattern, content)

# Build the mapped list for TS candidates
final_mappings = {}
matched = 0
unmatched = 0
for ts_name in ts_eng_names:
    if ts_name in raw_to_zh:
        final_mappings[ts_name] = raw_to_zh[ts_name]
        matched += 1
    elif ts_name in raw_eng_names:
        # Find it by index
        idx = raw_eng_names.index(ts_name)
        if idx < len(zh_names):
            final_mappings[ts_name] = zh_names[idx]
            matched += 1
        else:
            unmatched += 1
    else:
        unmatched += 1

print(f"\nMatched: {matched}, Unmatched: {unmatched}")

# Generate TS file
lines = [
    '// ============================================================',
    '// 候选人姓名中英文对照映射表',
    '// 数据来源: 选举结果表.csv + 汉译人名.txt',
    '// ============================================================',
    '',
    'const nameMap: Record<string, string> = {',
]
for eng in sorted(final_mappings.keys()):
    zh = final_mappings[eng]
    eng_esc = eng.replace("'", "\\'")
    lines.append(f"  '{eng_esc}': '{zh}',")
lines.extend([
    '}',
    '',
    '/** 通过英文候选人姓名获取中文翻译 */',
    'export function getCandNameZh(englishName: string): string | undefined {',
    '  return nameMap[englishName]',
    '}',
    '',
    '/** 候选人姓名中英文对照映射表 */',
    'export { nameMap as CAND_NAME_ZH_MAP }',
    '',
])

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"\nTS file generated: {out_path}")
print(f"Total mappings: {len(final_mappings)}")
print(f"Unique raw names: {len(raw_to_zh)}")
