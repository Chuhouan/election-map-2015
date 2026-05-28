import re, os
BASE = r'.'

# Fix MapPanel - remove swing mode
mp = open('components/map/MapPanel.tsx', 'r', encoding='utf-8').read()
mp = re.sub(r\"useState<.*?>\", \"useState<'seats' | 'margin' | 'turnout'>\", mp)
mp = re.sub(r\"\('seats', 'swing', 'margin', 'turnout'\)\", \"('seats', 'margin', 'turnout')\", mp)
open('components/map/MapPanel.tsx', 'w', encoding='utf-8', newline='\n').write(mp)
print('MapPanel fixed')

# Fix MapTooltip - add 12px gap
tt = open('components/map/MapTooltip.tsx', 'r', encoding='utf-8').read()
tt = tt.replace('translate(-50%, -100%)', 'translate(-50%, calc(-100% - 12px))')
tt = tt.replace('translate(-50%, 0)', 'translate(-50%, 12px)')
open('components/map/MapTooltip.tsx', 'w', encoding='utf-8', newline='\n').write(tt)
print('Tooltip fixed')

# Fix RightSidebar - remove Swingometer
rs = open('components/layout/RightSidebar.tsx', 'r', encoding='utf-8').read()
rs = rs.replace('import Swingometer from {chars}@/components/charts/Swingometer{chars}\n'.replace('{chars}', chr(39)), '')
rs = re.sub(r'\s*{/(.*?)摇摆计.*?Swingometer.*?</div>\s*}', '', rs, flags=re.DOTALL)
open('components/layout/RightSidebar.tsx', 'w', encoding='utf-8', newline='\n').write(rs)
print('Swingometer removed')

# Fix LeftSidebar - remove duplicate SeatChart
ls = open('components/layout/LeftSidebar.tsx', 'r', encoding='utf-8').read()
ls = ls.replace('import SeatChart from '+chr(39)+'@/components/charts/SeatChart'+chr(39)+'\n', '')
ls = re.sub(r'\s*{/.*?席位分布图.*?SeatChart />\s*</div>\s*}', '', ls, flags=re.DOTALL)
open('components/layout/LeftSidebar.tsx', 'w', encoding='utf-8', newline='\n').write(ls)
print('Duplicate chart removed')

print('ALL DONE')
