'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Clock, TrendingUp, TrendingDown, BarChart3, Target, X, Award, Flag } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateParty, translateRegion, translateNation } from '@/lib/i18n/translations'
import { type Constituency2015, PARTY_COLORS_2015 } from '@/lib/data/constituencies-2015-real'
import constituencyData from '@/lib/data/constituencies-2015-real'
import { translateConName, translateCandName } from '@/lib/data/name-translations'

interface RightSidebarProps {
  selectedConstituency?: Constituency2015 | null
}

// UK 2015 national benchmarks
const NATIONAL_TURNOUT_2015 = 66.1

export default function RightSidebar({ selectedConstituency }: RightSidebarProps) {
  const { t, lang } = useLanguage()

  return (
    <div className="w-96 bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedConstituency ? (
          <EmptyState key="empty" t={t} />
        ) : (
          <ConstituencyDetail key="detail" c={selectedConstituency} t={t} lang={lang} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// 空状态
// ============================================================
function EmptyState({ t }: { t: (key: any) => string }) {
  const { partySeats, nationalTurnout: natTurnout } = (() => {
    const partySeats: Record<string, number> = {}
    let totalVotes2015 = 0, totalElectorate2015 = 0
    constituencyData.forEach(c => {
      partySeats[c.winner] = (partySeats[c.winner] || 0) + 1
      totalVotes2015 += c.totalVotes
      totalElectorate2015 += c.electorate
    })
    return {
      partySeats,
      nationalTurnout: totalElectorate2015 > 0 ? (totalVotes2015 / totalElectorate2015 * 100) : 66.1
    }
  })()

  const topParties = [
    { name: t('sidebar.con'), color: '#0087DC', seats: partySeats['Conservative'] || 0 },
    { name: t('sidebar.lab'), color: '#DC241F', seats: partySeats['Labour'] || 0 },
    { name: t('sidebar.snp'), color: '#F5DC00', seats: partySeats['SNP'] || 0 },
    { name: t('sidebar.libdem'), color: '#FAA61A', seats: partySeats['Liberal Democrat'] || 0 },
  ].sort((a, b) => b.seats - a.seats)

  const maxSeats = topParties[0]?.seats || 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 flex flex-col h-full"
    >
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {t('sidebar.national')} · 2015
      </h2>

      {/* Key stats row */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-[10px] text-slate-400 uppercase">{t('sidebar.conSeats')}</div>
          <div className="text-xl font-bold text-[#0087DC] mt-0.5">{partySeats['Conservative'] || 330}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-[10px] text-slate-400 uppercase">{t('sidebar.nationalTurnout')}</div>
          <div className="text-xl font-bold text-slate-800 mt-0.5">{natTurnout.toFixed(1)}%</div>
        </div>
      </div>

      {/* Party bar chart */}
      <h3 className="text-xs font-medium text-slate-500 mb-3">{t('sidebar.parliament')} (650)</h3>
      <div className="space-y-2 mb-5">
        {topParties.map((p) => (
          <div key={p.name} className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-600 w-16 flex-shrink-0">{p.name}</span>
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(p.seats / 650) * 100}%`, backgroundColor: p.color }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-8 text-right flex-shrink-0">{p.seats}</span>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 w-16 flex-shrink-0">Others</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${((650 - (partySeats['Conservative']||0) - (partySeats['Labour']||0) - (partySeats['SNP']||0) - (partySeats['Liberal Democrat']||0)) / 650) * 100}%`, backgroundColor: '#94a3b8' }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 w-8 text-right flex-shrink-0">23</span>
        </div>
      </div>

      {/* Hint */}
      <div className="mt-auto">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('sidebar.clickMapHint')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// 选区详情
// ============================================================
function ConstituencyDetail({ c, t, lang }: { c: Constituency2015; t: (key: any) => string; lang: string }) {
  const winnerParty = c.winner
  const getPartyColor = (p: string) => PARTY_COLORS_2015[p] || '#888888'
  const sortedCandidates = [...c.candidates].sort((a, b) => b.votes - a.votes)
  const winnerCandidate = sortedCandidates.find(cand => cand.isWinner)
  const maxVotes = sortedCandidates[0]?.votes || 1

  // 安全度分类
  const majorityPct = c.totalVotes > 0 ? (c.majority / c.totalVotes) * 100 : 0
  const majorityLabel = majorityPct > 20 ? t('sidebar.safeSeat') : majorityPct > 10 ? t('sidebar.comfortable') : t('sidebar.marginalSeat')
  const majorityColor = majorityPct > 20 ? 'text-emerald-600' : majorityPct > 10 ? 'text-amber-600' : 'text-red-500'
  const majorityBg = majorityPct > 20 ? 'bg-emerald-50' : majorityPct > 10 ? 'bg-amber-50' : 'bg-red-50'

  // 前两名差距
  const firstPlace = sortedCandidates[0]
  const secondPlace = sortedCandidates[1]
  const gapVotes = secondPlace ? firstPlace.votes - secondPlace.votes : firstPlace.votes
  const gapPct = c.totalVotes > 0 ? (gapVotes / c.totalVotes) * 100 : 0

  // 投票率 vs 全国均值
  const turnoutDiff = c.turnout - NATIONAL_TURNOUT_2015

  // 胜者得票率
  const winnerShare = winnerCandidate?.voteShare || 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col"
    >
      {/* ========== 标题栏 ========== */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
              {lang === 'zh' ? translateConName(c.name) : c.name}
            </h2>
            <div className="flex items-center mt-1.5 space-x-1.5 text-xs text-slate-500">
              <span>{translateRegion(c.region, lang as any)}</span>
              {c.county && c.county !== c.region && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>{c.county}</span>
                </>
              )}
              <span className="text-slate-300">·</span>
              <span>{translateNation(c.nation, lang as any)}</span>
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-200 flex-shrink-0 ml-3"
            style={{ backgroundColor: getPartyColor(winnerParty) }}
          />
        </div>

        {/* 获胜政党 + 选举年份标签 */}
        <div className="flex items-center space-x-2 mt-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: getPartyColor(winnerParty) + '18',
              color: getPartyColor(winnerParty),
            }}
          >
            {translateParty(winnerParty, lang as any)}
          </span>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            {t('sidebar.election2015')}
          </span>
        </div>
      </div>

      {/* ========== 可滚动内容 ========== */}
      <div className="p-5 space-y-5">
        {/* ---- 模块1: 关键指标仪表盘 ---- */}
        <section>
          <div className="flex items-center mb-3">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-700">{t('sidebar.keyMetrics')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* 得票率 */}
            <MetricCard
              label={t('detail.voteShare')}
              value={`${winnerShare}%`}
              color={getPartyColor(winnerParty)}
              progress={winnerShare}
              progressColor={getPartyColor(winnerParty)}
            />
            {/* 投票率 */}
            <MetricCard
              label={t('detail.turnout')}
              value={`${c.turnout}%`}
              color={c.turnout >= 66 ? 'text-emerald-600' : 'text-amber-600'}
              progress={c.turnout}
              progressColor={c.turnout >= 66 ? '#059669' : '#d97706'}
              footnote={turnoutDiff !== 0 ? `${turnoutDiff > 0 ? '+' : ''}${turnoutDiff.toFixed(1)}% vs ${t('sidebar.nationalAvg')}` : undefined}
            />
            {/* 多数票 */}
            <MetricCard
              label={t('detail.majority')}
              value={c.majority.toLocaleString()}
              color={majorityColor}
              progress={Math.min((c.majority / 1000) * 4, 100)}
              progressColor={majorityPct > 20 ? '#059669' : majorityPct > 10 ? '#d97706' : '#ef4444'}
            />
            {/* 胜者 */}
            <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t('sidebar.mp')}</div>
              <div className="mt-1">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: getPartyColor(winnerParty) }}
                >
                  {lang === 'zh' ? translateCandName(winnerCandidate?.name || '') : (winnerCandidate?.name || '-')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {winnerCandidate?.votes?.toLocaleString()} {t('general.votes')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- 模块2: 得票分布（横向条形图） ---- */}
        <section>
          <div className="flex items-center mb-3">
            <Award className="w-4 h-4 mr-2 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-700">{t('sidebar.voteBreakdown')}</h3>
            <span className="ml-auto text-[10px] text-slate-400">{sortedCandidates.length} {t('sidebar.candidates').toLowerCase()}</span>
          </div>
          <div className="space-y-2">
            {sortedCandidates.map((cand, i) => {
              const barWidth = maxVotes > 0 ? (cand.votes / maxVotes) * 100 : 0
              const partyColor = getPartyColor(cand.party)
              return (
                <div
                  key={i}
                  className={`relative rounded-lg overflow-hidden ${
                    cand.isWinner ? 'ring-1 ring-offset-1' : ''
                  }`}
                  style={cand.isWinner ? { boxShadow: `0 0 0 2px ${partyColor}` } : {}}
                >
                  {/* 背景条 */}
                  <div className="absolute inset-0 bg-slate-100" />
                  {/* 填充条 */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg opacity-25"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: partyColor,
                    }}
                  />
                  {/* 内容 */}
                  <div className="relative flex items-center justify-between px-3 py-2.5 z-10">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: partyColor }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {lang === 'zh' ? translateCandName(cand.name) : cand.name}
                          </span>
                          {cand.isWinner && (
                            <Award className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {translateParty(cand.party, lang as any)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-sm font-semibold text-slate-700">
                        {cand.votes.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {cand.voteShare}%
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ---- 模块3: 竞争度分析 ---- */}
        {secondPlace && (
          <section>
            <div className="flex items-center mb-3">
              <Target className="w-4 h-4 mr-2 text-purple-500" />
              <h3 className="text-sm font-semibold text-slate-700">{t('sidebar.competitiveness')}</h3>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              {/* 前两名对比 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {t('sidebar.topTwo')}
                  </span>
                  <span className="text-[10px] text-slate-400">{t('sidebar.gap')}: {gapVotes.toLocaleString()} ({gapPct.toFixed(1)}%)</span>
                </div>
                {/* 第一名 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPartyColor(firstPlace.party) }} />
                    <span className="text-xs text-slate-600">{translateParty(firstPlace.party, lang as any)}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{firstPlace.votes.toLocaleString()}</span>
                </div>
                {/* 差距线 */}
                <div className="flex items-center my-2 px-2">
                  <div className="flex-1 h-px bg-slate-200 relative">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 text-[9px] text-slate-400"
                      style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      {gapPct < 5 ? (
                        <span className="text-red-500 font-bold">{gapPct.toFixed(1)}%</span>
                      ) : (
                        <span>{gapPct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* 第二名 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPartyColor(secondPlace.party) }} />
                    <span className="text-xs text-slate-600">{translateParty(secondPlace.party, lang as any)}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{secondPlace.votes.toLocaleString()}</span>
                </div>
              </div>

              {/* 分类标签 */}
              <div className="flex flex-wrap gap-1.5">
                {/* 安全度 */}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${majorityBg} ${majorityColor}`}>
                  {majorityLabel}
                </span>
                {/* 边缘/安全标签 */}
                {gapPct < 5 && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                    {t('sidebar.ultraMarginal')}
                  </span>
                )}
                {majorityPct > 30 && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    {t('sidebar.ultraSafe')}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---- 模块4: 选区画像 ---- */}
        <section>
          <div className="flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700">{t('sidebar.profile')}</h3>
          </div>
          <div className="space-y-2.5">
            {/* 选民数量 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('detail.electorate')}</span>
              <span className="font-semibold text-slate-800">{c.electorate.toLocaleString()}</span>
            </div>
            {/* 总票数 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('detail.totalVotes')}</span>
              <span className="font-semibold text-slate-800">{c.totalVotes.toLocaleString()}</span>
            </div>
            {/* 投票率对比 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('sidebar.turnoutVsNational')}</span>
              <div className="flex items-center space-x-1.5">
                {turnoutDiff >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={`font-semibold ${turnoutDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {turnoutDiff > 0 ? '+' : ''}{turnoutDiff.toFixed(1)}%
                </span>
              </div>
            </div>
            {/* 多数票占比 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('sidebar.majorityPct')}</span>
              <span className={`font-semibold ${majorityColor}`}>
                {majorityPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

// ============================================================
// 指标卡片子组件
// ============================================================
function MetricCard({
  label,
  value,
  color,
  progress,
  progressColor,
  footnote,
}: {
  label: string
  value: string
  color: string
  progress: number
  progressColor: string
  footnote?: string
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold mt-1 ${color}`}>
        {value}
      </div>
      {/* 进度条 */}
      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
      {footnote && (
        <div className="text-[9px] text-slate-400 mt-1">{footnote}</div>
      )}
    </div>
  )
}
