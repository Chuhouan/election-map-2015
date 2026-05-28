"""Find David Cameron in raw data vs Chinese names"""
import csv

raw_csv = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\选举结果表.csv'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'

# Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    zh_names = [l.strip() for l in f.read().split('\n') if l.strip() and not l.startswith('以下是')]

# Find David Cameron in raw data
raw_eng = []
with open(raw_csv, 'r', encoding='gbk') as f:
    reader = csv.DictReader(f)
    for row in reader:
        forename = row.get('Forename', '').strip()
        surname = row.get('Surname', '').strip()
        raw_eng.append(f"{forename} {surname}".strip())

# Find David Cameron in raw data
for i, name in enumerate(raw_eng):
    if 'David' in name and 'Cameron' in name:
        print(f"Raw index {i}: {name}")
        # Also show constiuency
        break

# Find 戴维·卡梅伦 in Chinese names
for i, name in enumerate(zh_names):
    if name == '戴维·卡梅伦':
        print(f"Chinese index {i}: {name}")
        print(f"English at that index: {raw_eng[i] if i < len(raw_eng) else 'N/A'}")
        break

# Also check: maybe there are multiple entries for David Cameron?
cam_indices = [i for i, name in enumerate(raw_eng) if name == 'David Cameron']
print(f"\nDavid Cameron appears at raw indices: {cam_indices}")
for idx in cam_indices:
    if idx < len(zh_names):
        print(f"  Chinese at idx {idx}: {zh_names[idx]}")
