import { PARTY_NAME_CN } from '@/lib/i18n/translations'

// 选区名称翻译：词条按长度从长到短排序，确保长匹配优先
const CON_NAME_MAP: Record<string, string> = {
  // === 复合方向词（放在前面避免被单字误替换）===
  'North East': '东北', 'North West': '西北',
  'South East': '东南', 'South West': '西南',

  // === 完整行政区 / 复合地名 ===
  'Kingston upon Thames': '泰晤士河畔金斯顿',
  'City of Durham': '达勒姆市',
  'Cities of London and Westminster': '伦敦市与威斯敏斯特',
  'Isle of Wight': '怀特岛',
  'Isles of Scilly': '锡利群岛',
  'Tower Hamlets': '塔村',
  'Tunbridge Wells': '坦布里奇韦尔斯',
  'Milton Keynes': '米尔顿凯恩斯',
  'Blaenau Gwent': '布莱诺格温特',
  'Port Talbot': '塔尔伯特港',
  'East Kilbride': '东基尔布赖德',
  'Kingston upon Hull': '赫尔河畔金斯顿',
  'Southend on Sea': '滨海绍森德',
  'Stoke on Trent': '特伦特河畔斯托克',
  'Westminster': '威斯敏斯特',
  'Regent\'s Park': '摄政公园',
  'Bethnal Green': '贝斯纳尔格林',
  'Golders Green': '戈尔德斯格林',
  'Wood Green': '伍德格林',
  'Forest Hill': '福里斯特希尔',
  'Mill Hill': '米尔希尔',
  'Hornchurch and Upminster': '霍恩彻奇与阿普敏斯特',
  'Chipping Barnet': '奇平巴内特',
  'Elephant & Castle': '大象城堡',
  'Richmond Park': '里士满公园',
  'Sherwood Forest': '舍伍德森林',
  'High Peak': '高峰',
  'St Albans': '圣奥尔本斯',
  'Great Yarmouth': '大雅茅斯',
  'Bury St Edmunds': '贝里圣埃德蒙兹',

  // === 城市（被包含在选区名中的）===
  'London': '伦敦', 'Liverpool': '利物浦', 'Manchester': '曼彻斯特',
  'Birmingham': '伯明翰', 'Bristol': '布里斯托尔', 'Newcastle': '纽卡斯尔',
  'Leeds': '利兹', 'Sheffield': '谢菲尔德', 'Nottingham': '诺丁汉',
  'Leicester': '莱斯特', 'Southampton': '南安普顿', 'Portsmouth': '朴茨茅斯',
  'Oxford': '牛津', 'Cambridge': '剑桥', 'Bath': '巴斯', 'Norwich': '诺里奇',
  'Brighton': '布莱顿', 'Plymouth': '普利茅斯', 'Coventry': '考文垂',
  'Cardiff': '卡迪夫', 'Edinburgh': '爱丁堡', 'Glasgow': '格拉斯哥',
  'Aberdeen': '阿伯丁', 'Dundee': '邓迪', 'Belfast': '贝尔法斯特',
  'Swansea': '斯旺西', 'Newport': '纽波特', 'Derby': '德比',
  'Hull': '赫尔', 'Bradford': '布拉德福德', 'York': '约克',
  'Exeter': '埃克塞特', 'Chester': '切斯特', 'Durham': '达勒姆',
  'Canterbury': '坎特伯雷', 'Wolverhampton': '伍尔弗汉普顿',
  'Stoke': '斯托克', 'Reading': '雷丁',
  'Sunderland': '桑德兰', 'Middlesbrough': '米德尔斯堡',
  'Bolton': '博尔顿', 'Wigan': '维冈', 'Stockport': '斯托克波特',
  'Huddersfield': '哈德斯菲尔德', 'Blackburn': '布莱克本',
  'Preston': '普雷斯顿', 'Blackpool': '布莱克浦', 'Burnley': '伯恩利',
  'Oldham': '奥尔德姆', 'Rochdale': '罗奇代尔', 'Bury': '伯里',
  'Salford': '索尔福德', 'Warrington': '沃灵顿', 'Carlisle': '卡莱尔',
  'Lancaster': '兰卡斯特', 'Lincoln': '林肯', 'Gloucester': '格洛斯特',
  'Worcester': '伍斯特', 'Hereford': '赫里福德', 'Shrewsbury': '什鲁斯伯里',
  'Wrexham': '雷克瑟姆', 'Colchester': '科尔切斯特', 'Ipswich': '伊普斯维奇',
  'Bournemouth': '伯恩茅斯', 'Hastings': '黑斯廷斯',
  'Dover': '多佛', 'Maidstone': '梅德斯通',
  'Guildford': '吉尔福德', 'Cheltenham': '切尔滕纳姆',
  'Swindon': '斯温登', 'Peterborough': '彼得伯勒',
  'Northampton': '北安普顿', 'Bedford': '贝德福德', 'Luton': '卢顿',
  'Watford': '沃特福德', 'Stevenage': '斯蒂夫尼奇', 'Harlow': '哈洛',
  'Basildon': '巴西尔登', 'Southend': '滨海绍森德', 'Chelmsford': '切姆斯福德',
  'Inverness': '因弗内斯', 'Stirling': '斯特灵', 'Perth': '珀斯',
  'Ayr': '艾尔', 'Kilmarnock': '基尔马诺克', 'Paisley': '佩斯利',
  'Motherwell': '马瑟韦尔', 'Falkirk': '福尔柯克', 'Dunfermline': '邓弗姆林',
  'Kirkcaldy': '柯科迪', 'Greenock': '格里诺克', 'Coatbridge': '科特布里奇',
  'Airdrie': '艾尔德里', 'Rutherglen': '拉瑟格伦', 'Hamilton': '汉密尔顿',
  'Cumbernauld': '坎伯诺尔德', 'Livingston': '利文斯顿',
  'Glenrothes': '格伦罗西斯',
  'Chichester': '奇切斯特', 'Winchester': '温彻斯特',
  'Salisbury': '索尔兹伯里', 'Bridgend': '布里真德',
  'Merthyr': '梅瑟', 'Caerphilly': '卡菲利',
  'Neath': '尼思', 'Carmarthen': '卡马森', 'Pembroke': '彭布罗克',
  'Brecon': '布雷肯', 'Anglesey': '安格尔西',
  'Ashford': '阿什福德', 'Crawley': '克劳利', 'Horsham': '霍舍姆',
  'Worthing': '沃辛', 'Eastbourne': '伊斯特本',
  'Kingston': '金斯顿', 'Richmond': '里士满',
  'Kensington': '肯辛顿', 'Chelsea': '切尔西',
  'Holborn': '霍尔本', 'Islington': '伊斯灵顿', 'Hackney': '哈克尼',
  'Lewisham': '刘易舍姆', 'Greenwich': '格林威治', 'Woolwich': '伍尔维奇',
  'Poplar': '波普勒', 'Shoreditch': '肖尔迪奇',
  'Hampstead': '汉普斯特德', 'Kilburn': '基尔本',
  'Camden': '卡姆登', 'Paddington': '帕丁顿', 'Marylebone': '马里波恩',
  'Bermondsey': '伯蒙德赛', 'Southwark': '萨瑟克',
  'Peckham': '佩卡姆', 'Camberwell': '坎伯韦尔',
  'Brixton': '布里克斯顿', 'Clapham': '克拉珀姆',
  'Putney': '帕特尼', 'Wimbledon': '温布尔登',
  'Battersea': '巴特西', 'Wandsworth': '旺兹沃思',
  'Tooting': '图厅', 'Streatham': '斯特里汉姆',
  'Dulwich': '达利奇', 'Norwood': '诺伍德',
  'Eltham': '埃尔瑟姆', 'Erith': '埃里斯',
  'Bexley': '贝克斯利', 'Sidcup': '锡德卡普',
  'Chislehurst': '奇斯尔赫斯特', 'Orpington': '奥平顿', 'Bromley': '布罗姆利',
  'Croydon': '克罗伊登', 'Mitcham': '米查姆', 'Morden': '莫登',
  'Sutton': '萨顿', 'Cheam': '奇姆', 'Carshalton': '卡肖尔顿',
  'Epsom': '埃普索姆', 'Ewell': '尤厄尔',
  'Twickenham': '特威克纳姆', 'Hampton': '汉普顿', 'Feltham': '费尔特姆',
  'Heston': '赫斯顿', 'Isleworth': '艾尔沃思', 'Brentford': '布伦特福德',
  'Chiswick': '奇西克', 'Ealing': '伊灵', 'Acton': '阿克顿',
  'Southall': '索撒尔', 'Greenford': '格林福德', 'Harlesden': '哈勒斯登',
  'Willesden': '威尔斯登', 'Wembley': '温布利', 'Harrow': '哈罗',
  'Pinner': '皮纳', 'Stanmore': '斯坦莫尔', 'Edgware': '埃奇韦尔',
  'Hendon': '亨登', 'Finchley': '芬奇利', 'Barnet': '巴内特',
  'Enfield': '恩菲尔德', 'Southgate': '南盖特', 'Edmonton': '埃德蒙顿',
  'Tottenham': '托特纳姆', 'Hornsey': '霍恩西',
  'Walthamstow': '沃尔瑟姆斯托', 'Leyton': '莱顿', 'Wanstead': '旺斯特德',
  'Ilford': '伊尔福德', 'Romford': '罗姆福德',
  'Rainham': '雷纳姆', 'Dagenham': '达格纳姆', 'Barking': '巴金',
  'Plaistow': '普拉斯托', 'Deptford': '德特福德', 'Catford': '凯特福德',
  'Sydenham': '锡德纳姆', 'Penge': '彭奇', 'Beckenham': '贝肯汉姆',
  'Lambeth': '兰贝斯', 'Vauxhall': '沃克斯豪尔', 'Stockwell': '斯托克韦尔',
  'Kennington': '肯宁顿', 'Waterloo': '滑铁卢',
  'Loughborough': '拉夫伯勒', 'Lichfield': '利奇菲尔德',
  'Tamworth': '塔姆沃思', 'Stafford': '斯塔福德', 'Cannock': '坎诺克',
  'Burton': '伯顿', 'Crewe': '克鲁', 'Nantwich': '纳尼奇',
  'Congleton': '康格尔顿', 'Macclesfield': '麦克尔斯菲尔德',
  'Altrincham': '奥尔特林厄姆', 'Sale': '塞尔', 'Stretford': '斯特雷特福德',
  'Eccles': '埃克尔斯', 'Swinton': '斯温顿',
  'Radcliffe': '拉德克利夫', 'Whitefield': '怀特菲尔德',
  'Barrow': '巴罗', 'Fleetwood': ' Fleetwood',
  'Furness': '弗内斯', 'Birkenhead': '伯肯黑德',
  'Bootle': '布特尔', 'Chorley': '乔利', 'Fylde': '法尔德',
  'Halton': '哈尔顿', 'Knowsley': '诺斯利', 'Runcorn': '朗科恩',
  'Ashton': '阿什顿', 'Hyndburn': '海因德本',
  'Scunthorpe': '斯肯索普', 'Rotherham': '罗瑟勒姆',
  'Doncaster': '唐卡斯特', 'Barnsley': '巴恩斯利', 'Wakefield': '韦克菲尔德',
  'Halifax': '哈利法克斯', 'Dewsbury': '迪斯伯里', 'Batley': '巴特利',
  'Spen': '斯彭', 'Morpeth': '莫珀斯', 'Berwick': '贝里克',
  'Hexham': '赫克瑟姆', 'Jarrow': '贾罗', 'Gateshead': '盖茨黑德',
  'South Shields': '南希尔兹', 'Tynemouth': '泰恩茅斯',
  'Hartlepool': '哈特尔浦', 'Darlington': '达灵顿',
  'Redcar': '雷德卡', 'Stockton': '斯托克顿', 'Thornaby': '索纳比',
  'Mansfield': '曼斯菲尔德', 'Chesterfield': '切斯特菲尔德',
  'Newark': '纽瓦克', 'Gainsborough': '盖恩斯伯勒',
  'Grantham': '格兰瑟姆', 'Bourne': '伯恩', 'Kettering': '凯特林',
  'Corby': '科比', 'Daventry': '达文特里', 'Rushcliffe': '拉什克利夫',
  'Broxtowe': '布罗克斯托', 'Gedling': '盖德灵', 'Erewash': '埃尔瓦什',
  'Bolsover': '博尔索弗', 'Ashfield': '阿什菲尔德',
  'Bassetlaw': '巴塞特洛', 'Amber Valley': '安伯河谷',
  'Wellingborough': '韦灵伯勒', 'Rushden': '拉什登',
  'Hinckley': '欣克利', 'Bosworth': '博斯沃思',
  'Harborough': '哈伯勒', 'Melton': '梅尔顿', 'Syston': '西斯顿',
  'Louth': '劳斯', 'Horncastle': '霍恩卡斯尔',
  'Stamford': '斯坦福', 'Oakham': '奥克姆',

  // === 威尔士地名 ===
  'Londonderry': '伦敦德里', 'Larne': '拉恩', 'Antrim': '安特里姆',
  'Armagh': '阿尔马', 'Fermanagh': '弗马纳', 'Tyrone': '蒂龙',
  'Omagh': '奥马', 'Newry': '纽里', 'Dungannon': '邓甘嫩',
  'Enniskillen': '恩尼斯基林', 'Down': '唐郡',
  'Rhondda': '朗达', 'Torfaen': '托法恩', 'Torquay': '托基',
  'Ceredigion': '锡尔迪金', 'Clwyd': '克卢伊德', 'Dyfed': '达费德',
  'Gwent': '格温特', 'Powys': '波伊斯',

  // === 常见地理通名 ===
  'and': '与', 'Central': '中央',
  'Upper': '上', 'Lower': '下', 'Great': '大', 'Little': '小',
  'New': '新', 'Old': '旧', 'Saint': '圣', 'St ': '圣 ',
  'Forest': '森林', 'Valley': '谷', 'Heath': '荒地', 'Moor': '荒野',
  'Dale': '谷', 'Field': '原野', 'Hamlet': '小村', 'Vale': '谷',
  'Sea': '海', 'Island': '岛', 'Hill': '山', 'Bridge': '桥',
  'Bay': '湾', 'Point': '角', 'Port': '港', 'Market': '市集',
  'Abbey': '修道院', 'Castle': '城堡', 'Church': '教堂',
  'Park': '公园', 'Garden': '花园', 'Town': '镇', 'City': '市',
  'upon': '河畔', 'on': '河畔', 'Leigh': '利', 'Wick': '威克',
  'bury': '伯里', 'ham': '汉', 'ton': '顿', 'ley': '利',
  'mouth': '茅斯', 'ford': '福德', 'field': '菲尔德',
  'bridge': '桥', 'pool': '浦', 'gate': '门',
}

/** 翻译选区名称（替换已知城市/地名 + 方向词） */
export function translateConName(name: string): string {
  // 按词条长度从长到短排序，确保长匹配优先
  const sorted = Object.entries(CON_NAME_MAP).sort((a, b) => b[0].length - a[0].length)
  let result = name
  for (const [eng, chn] of sorted) {
    result = result.replace(eng, chn)
  }
  return result
}

/** 翻译候选人姓名 */
export function translateCandName(name: string): string {
  // 处理伪造数据 "Candidate Labour" → "工党候选人"
  const candidateMatch = name.match(/^Candidate\s+(.+)$/)
  if (candidateMatch) {
    const partyKey = candidateMatch[1]
    const partyCN = PARTY_NAME_CN[partyKey]
    if (partyCN) return `${partyCN}候选人`
    return `${partyKey}候选人`
  }

  // 处理 "Other Candidate"
  if (name === 'Other Candidate' || name === 'Other') {
    return '其他候选人'
  }

  // 已知政治家姓名
  const known: Record<string, string> = {
    'David Cameron': '戴维·卡梅伦', 'Ed Miliband': '埃德·米利班德',
    'Nick Clegg': '尼克·克莱格', 'Nigel Farage': '奈杰尔·法拉奇',
    'Nicola Sturgeon': '尼古拉·斯特金', 'Boris Johnson': '鲍里斯·约翰逊',
    'Theresa May': '特蕾莎·梅', 'Jeremy Corbyn': '杰里米·科尔宾',
    'John Bercow': '约翰·伯考', 'Caroline Lucas': '卡罗琳·卢卡斯',
    'Natalie Bennett': '娜塔莉·贝内特', 'Leanne Wood': '莉安·伍德',
    'Angus Robertson': '安格斯·罗伯逊', 'Pete Wishart': '皮特·威沙特',
    'Stewart Hosie': '斯图尔特·霍西', 'Mike Weir': '迈克·韦尔',
    'Alex Salmond': '亚历克斯·萨尔蒙德', 'Douglas Alexander': '道格拉斯·亚历山大',
    'Ed Balls': '埃德·鲍尔斯', 'Danny Alexander': '丹尼·亚历山大',
    'Vince Cable': '文斯·凯布尔', 'Simon Hughes': '西蒙·休斯',
    'Tim Farron': '蒂姆·法伦', 'David Laws': '大卫·劳斯',
    'Michael Gove': '迈克尔·戈夫', 'George Osborne': '乔治·奥斯本',
    'Philip Hammond': '菲利普·哈蒙德', 'William Hague': '威廉·黑格',
    'Jeremy Hunt': '杰里米·亨特', 'Iain Duncan Smith': '伊恩·邓肯·史密斯',
    'Chris Grayling': '克里斯·格雷林', 'Justine Greening': '贾斯汀·格里宁',
    'Oliver Letwin': '奥利弗·莱特温', 'Patrick McLoughlin': '帕特里克·麦克洛克林',
    'David Lidington': '大卫·利丁顿', 'Alistair Carmichael': '阿利斯泰尔·卡迈克尔',
    'David Mundell': '大卫·蒙代尔', 'Theresa Villiers': '特蕾莎·维利尔斯',
    'John Redwood': '约翰·雷德伍德', 'Kenneth Clarke': '肯尼斯·克拉克',
    'Harriet Harman': '哈里特·哈曼', 'John McDonnell': '约翰·麦克唐奈',
    'Alan Johnson': '艾伦·约翰逊', 'Yvette Cooper': '伊薇特·库珀',
    'Andy Burnham': '安迪·伯纳姆', 'Chris Bryant': '克里斯·布莱恩特',
    'Hilary Benn': '希拉里·本', 'Margaret Hodge': '玛格丽特·霍奇',
    'Diane Abbott': '黛安·阿博特', 'Sadiq Khan': '萨迪克·汗',
    'Chuka Umunna': '楚卡·乌穆纳', 'Rachel Reeves': '蕾切尔·里夫斯',
    'Jack Straw': '杰克·斯特劳', 'Gordon Brown': '戈登·布朗',
    'Tony Blair': '托尼·布莱尔', 'Peter Mandelson': '彼得·曼德尔森',
    'David Miliband': '大卫·米利班德', 'Angela Eagle': '安吉拉·伊格尔',
    'Maria Eagle': '玛丽亚·伊格尔', 'Emily Thornberry': '艾米丽·索恩伯里',
    'Jon Trickett': '乔恩·特里克特', 'Ian Blackford': '伊恩·布莱克福德',
    'Owen Smith': '欧文·史密斯', 'Dan Jarvis': '丹·贾维斯',
  }

  return known[name] || name
}
