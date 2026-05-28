"""Smart matching: deduplicate raw data, then align with Chinese names"""
import csv, re

raw_csv = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\选举结果表.csv'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'

# Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    zh_names = [l.strip() for l in f.read().split('\n') if l.strip() and not l.startswith('以下是')]

# Strategy: read raw CSV and only keep FIRST occurrence of each unique name
raw_eng_deduped = []
seen = set()
with open(raw_csv, 'r', encoding='gbk') as f:
    reader = csv.DictReader(f)
    for row in reader:
        forename = row.get('Forename', '').strip()
        surname = row.get('Surname', '').strip()
        full_name = f"{forename} {surname}".strip()
        if full_name not in seen:
            seen.add(full_name)
            raw_eng_deduped.append(full_name)

print(f"Raw deduped: {len(raw_eng_deduped)}, Chinese: {len(zh_names)}")

# Now check alignment
print("\nFirst 5:")
for i in range(5):
    zh = zh_names[i] if i < len(zh_names) else 'N/A'
    print(f"  {raw_eng_deduped[i]:40s} -> {zh}")

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
    if eng in raw_eng_deduped:
        idx = raw_eng_deduped.index(eng)
        actual = zh_names[idx] if idx < len(zh_names) else 'N/A'
        status = "OK" if actual == expected else "MISMATCH"
        print(f"  [{status}] idx={idx:4d}  {eng:35s} expected={expected:20s} actual={actual}")
    else:
        print(f"  [NOT FOUND] {eng}")
