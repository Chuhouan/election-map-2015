"""Try to understand the ordering of the Chinese name list"""
import re

data_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\constituencies-2015-real.ts'
zh_path = r'C:\Users\63259\CodeBuddy\20260528014453\lib\data\汉译人名.txt'

# Read Chinese names
with open(zh_path, 'r', encoding='gbk') as f:
    content = f.read()
zh_names = [l.strip() for l in content.split('\n') if l.strip() and not l.startswith('以下是')]

# Read English candidate names
with open(data_path, 'r', encoding='utf-8') as f:
    content = f.read()
cand_pattern = r'name:\s*[\x27\x22]([^\x27\x22]+)[\x27\x22],\s*\n\s+party:\s*[\x27\x22]'
eng_names = re.findall(cand_pattern, content)

# Check: what English name is at the same index as key Chinese names?
known_mapping = {
    '杰里米·科尔宾': 'Jeremy Corbyn',
    '戴维·卡梅伦': 'David Cameron', 
    '埃德·米利班德': 'Ed Miliband',
    '尼克·克莱格': 'Nick Clegg',
    '奈杰尔·法拉奇': 'Nigel Farage',
    '鲍里斯·约翰逊': 'Boris Johnson',
    '特蕾莎·梅': 'Theresa May',
}

for zh_name, expected_eng in known_mapping.items():
    if zh_name in zh_names:
        idx = zh_names.index(zh_name)
        eng_at_idx = eng_names[idx] if idx < len(eng_names) else 'N/A'
        match = "=> MATCH!" if eng_at_idx == expected_eng else ""
        print(f"index {idx:4d}: ZH={zh_name:15s}  EN={eng_at_idx:35s} {match}")
    
print("\n--- Candidates that appear multiple times in data ---")
from collections import Counter
eng_counts = Counter(eng_names)
for name, count in eng_counts.most_common(10):
    print(f"  {name:35s} appears {count} times")
