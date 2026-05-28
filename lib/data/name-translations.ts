export function translateConName(name: string): string {
  const m: Record<string, string> = {
    'London': '伦敦', 'Liverpool': '利物浦', 'Manchester': '曼彻斯特',
    'Birmingham': '伯明翰', 'Bristol': '布里斯托尔', 'Newcastle': '纽卡斯尔',
    'Leeds': '利兹', 'Sheffield': '谢菲尔德', 'Nottingham': '诺丁汉',
    'Leicester': '莱斯特', 'Southampton': '南安普顿', 'Portsmouth': '朴茨茅斯',
    'Oxford': '牛津', 'Cambridge': '剑桥', 'Bath': '巴斯', 'Norwich': '诺里奇',
    'Brighton': '布莱顿', 'Plymouth': '普利茅斯', 'Coventry': '考文垂',
    'Cardiff': '卡迪夫', 'Edinburgh': '爱丁堡', 'Glasgow': '格拉斯哥',
    'Aberdeen': '阿伯丁', 'Dundee': '邓迪', 'Belfast': '贝尔法斯特',
  }
  // Check if name contains any known city
  for (const [eng, chn] of Object.entries(m)) {
    if (name.includes(eng)) return name.replace(eng, chn)
  }
  return name
}

export function translateCandName(name: string): string {
  const known: Record<string, string> = {
    'David Cameron': '戴维·卡梅伦', 'Ed Miliband': '埃德·米利班德',
    'Nick Clegg': '尼克·克莱格', 'Nigel Farage': '奈杰尔·法拉奇',
    'Nicola Sturgeon': '尼古拉·斯特金', 'Boris Johnson': '鲍里斯·约翰逊',
    'Theresa May': '特蕾莎·梅', 'Jeremy Corbyn': '杰里米·科尔宾',
    'John Bercow': '约翰·伯考', 'Caroline Lucas': '卡罗琳·卢卡斯',
  }
  return known[name]; name
}
