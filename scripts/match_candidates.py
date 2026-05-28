"""Generate candidate Chinese name TypeScript mapping (position-based pairing)"""
import re, sys

data_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\constituencies-2015-real.ts'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'
out_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\candidate-name-zh.ts'

# Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    content = f.read()

zh_names = []
for line in content.strip().split('\n'):
    line = line.strip()
    if line and not line.startswith('以下是'):
        zh_names.append(line)

print(f"Chinese names from file: {len(zh_names)}")

# Read English candidate names
with open(data_path, 'r', encoding='utf-8') as f:
    content = f.read()

cand_pattern = r'name:\s*[\x27\x22]([^\x27\x22]+)[\x27\x22],\s*\n\s+party:\s*[\x27\x22]'
eng_names = re.findall(cand_pattern, content)
print(f"English candidate names: {len(eng_names)}")

# Check duplicates
unique_eng = list(dict.fromkeys(eng_names))
print(f"Unique English candidates: {len(unique_eng)}")
unique_zh = list(dict.fromkeys(zh_names))
print(f"Unique Chinese names: {len(unique_zh)}")

# Build position-based map
map_size = min(len(eng_names), len(zh_names))
print(f"\nBuilding {map_size} position-based mappings...")

# Check first & last 5 pairs
print("\nFirst 5 pairs:")
for i in range(5):
    print(f"  {eng_names[i]:40s} -> {zh_names[i]}")
print("\nLast 5 pairs:")
for i in range(max(0, map_size-5), map_size):
    print(f"  {eng_names[i]:40s} -> {zh_names[i]}")

# Verify known politicians
print("\nVerifying known politicians:")
known = {
    'David Cameron': '戴维·卡梅伦', 'Ed Miliband': '埃德·米利班德',
    'Nick Clegg': '尼克·克莱格', 'Nigel Farage': '奈杰尔·法拉奇',
    'Boris Johnson': '鲍里斯·约翰逊', 'Theresa May': '特蕾莎·梅',
    'Jeremy Corbyn': '杰里米·科尔宾', 'John Bercow': '约翰·伯考',
    'Caroline Lucas': '卡罗琳·卢卡斯', 'Sadiq Khan': '萨迪克·汗',
    'Michael Gove': '迈克尔·戈夫', 'George Osborne': '乔治·奥斯本',
}
for eng, expected in known.items():
    if eng in eng_names:
        idx = eng_names.index(eng)
        actual = zh_names[idx] if idx < len(zh_names) else 'N/A'
        status = "OK" if actual == expected else "MISMATCH"
        print(f"  [{status}] {eng:35s} idx={idx:4d}  expected={expected:15s}  actual={actual}")
    else:
        print(f"  [NOT FOUND] {eng}")
