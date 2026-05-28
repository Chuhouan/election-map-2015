"""生成选区中文名称的 TypeScript 映射文件"""
import csv, re

pa_csv = r'c:\Users\63259\CodeBuddy\20260528014453\lib\data\2015年英国大选各选区投票数据.csv'
zh_csv = r'c:\Users\63259\CodeBuddy\20260528014453\lib\data\选区中文9.csv'
ts_path = r'c:\Users\63259\CodeBuddy\20260528014453\lib\data\constituencies-2015-real.ts'
out_path = r'c:\Users\63259\CodeBuddy\20260528014453\lib\data\constituency-name-zh.ts'

# 1. Read PA English names
pa_eng = {}
with open(pa_csv, 'r', encoding='utf-8') as f:
    for row in csv.reader(f):
        if not row or not row[0].strip(): continue
        try:
            pa_id = int(row[0].strip())
            pa_eng[pa_id] = row[1].strip()
        except ValueError:
            continue

# 2. Read Chinese names
zh_names = {}
with open(zh_csv, 'r', encoding='gbk') as f:
    for row in csv.reader(f):
        if not row or not row[0].strip(): continue
        try:
            cid = int(row[0].strip())
            zh_names[cid] = row[1].strip()
        except ValueError:
            continue

# 3. Read TS constituency names
with open(ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

ts_names = re.findall(r'id:\s*\d+,\s*\n\s+name:\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]', content)

def norm(s):
    """Normalize for matching: &->and, remove commas, lowercase, sort words"""
    s = s.replace(' & ', ' and ').replace('&', ' and ')
    s = s.replace(',', '').replace("'", '').replace('-', ' ')
    s = re.sub(r'\s+', ' ', s).strip().lower()
    return ' '.join(sorted(s.split()))

# Build PA lookup by normalized name
pa_by_norm = {}
for pid, name in pa_eng.items():
    pa_by_norm[norm(name)] = (name, pid)

# Manual overrides for unmatched
manual_map = {}
for pid, n in pa_eng.items():
    if n == 'Hull East':
        manual_map['Kingston upon Hull East'] = zh_names[pid]
    elif n == 'Hull North':
        manual_map['Kingston upon Hull North'] = zh_names[pid]
    elif n == 'Hull West & Hessle':
        manual_map['Kingston upon Hull West and Hessle'] = zh_names[pid]

# Build map
final_map = {}
match_count = 0
for ts_name in ts_names:
    nk = norm(ts_name)
    if nk in pa_by_norm:
        pa_name, pid = pa_by_norm[nk]
        final_map[ts_name] = zh_names[pid]
        match_count += 1
    elif ts_name in manual_map:
        final_map[ts_name] = manual_map[ts_name]
        match_count += 1

# Check unmatched
unmapped = [n for n in ts_names if n not in final_map]
if unmapped:
    print(f"WARNING: {len(unmapped)} unmatched:")
    for n in unmapped:
        print(f"  '{n}'")
        # Try fuzzy match
        nk = norm(n)
        candidates = [(nk2, pa_by_norm[nk2]) for nk2 in pa_by_norm.keys() 
                      if len(set(nk.split()) & set(nk2.split())) > 3]
        if candidates:
            print(f"    Candidates: {[c[1][0] for c in candidates[:3]]}")

print(f"Matched: {match_count} / {len(ts_names)}")

# Generate TS file
lines = [
    '// ============================================================',
    '// 选区名称中英文对照映射表 (650 选区)',
    '// 数据来源: 选区中文9.csv + constituencies-2015-real.ts',
    '// ============================================================',
    '',
    'const nameMap: Record<string, string> = {',
]
for eng in ts_names:
    zh = final_map.get(eng, '')
    if zh:
        eng_esc = eng.replace("'", "\\'")
        lines.append(f"  '{eng_esc}': '{zh}',")
lines.extend([
    '}',
    '',
    '/** 通过英文选区名称获取准确的中文翻译 */',
    'export function getConNameZh(englishName: string): string | undefined {',
    '  return nameMap[englishName]',
    '}',
    '',
    '/** 选区名称中英文对照映射表 */',
    'export { nameMap as CON_NAME_ZH_MAP }',
    '',
])

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"TS 文件已生成: {out_path}")
print(f"共 {match_count} 条映射")
