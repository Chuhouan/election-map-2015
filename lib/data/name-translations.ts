import { PARTY_NAME_CN } from '@/lib/i18n/translations'
import { getConNameZh } from './constituency-name-zh'
import { getCandNameZh } from './candidate-name-zh'

// 选区名称翻译：词条按长度从长到短排序，确保长匹配优先（备用，用于非精确匹配的情况）
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
}

/** 翻译选区名称（优先使用 CSV 精确翻译，其次字典替换） */
export function translateConName(name: string): string {
  // 优先使用精确查找（650 选区 CSV 映射）
  const exact = getConNameZh(name)
  if (exact) return exact

  // 回退：字典替换式翻译（适用于非标准选区名或复合地名）
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

  // 优先使用完整映射表（3971 条英中姓名对应）
  const fullMapResult = getCandNameZh(name)
  if (fullMapResult) return fullMapResult

  // 回退：已知政治家姓名（作为后备）
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
