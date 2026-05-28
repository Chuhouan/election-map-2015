'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, BarChart3, Target } from 'lucide-react'
import ParliamentChart from '@/components/charts/ParliamentChart'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import constituencyData from '@/lib/data/constituencies-2015-real'

const totalSeats2015 = 650
const majorityLine2015 = 326

function getStats2015() {
  const partySeats: Record<string, number> = {}
  constituencyData.forEach(c => {
    partySeats[c.winner] = (partySeats[c.winner] || 0) + 1
  })

  const totalVotes = constituencyData.reduce((s, c) => s + c.totalVotes, 0)
  const totalElectorate = constituencyData.reduce((s, c) => s + c.electorate, 0)
  const nationalTurnout2015 = totalElectorate > 0 ? (totalVotes / totalElectorate * 100) : 66.1

  return { partySeats, nationalTurnout: nationalTurnout2015 }
}

export default function LeftSidebar() {
  const { t } = useLanguage()
  const { partySeats, nationalTurnout: natTurnout } = getStats2015()

  const seatData = [
    { party: 'Conservative', partyKey: 'sidebar.con', seats: partySeats['Conservative'] || 0, change: '+24', color: 'bg-party-conservative' },
    { party: 'Labour', partyKey: 'sidebar.lab', seats: partySeats['Labour'] || 0, change: '-26', color: 'bg-party-labour' },
    { party: 'SNP', partyKey: 'sidebar.snp', seats: partySeats['SNP'] || 0, change: '+50', color: 'bg-party-snp' },
    { party: 'Lib Dem', partyKey: 'sidebar.libdem', seats: partySeats['Liberal Democrat'] || 0, change: '-49', color: 'bg-party-libdem' },
    { party: 'UKIP', partyKey: 'sidebar.ukip', seats: partySeats['UKIP'] || 0, change: '+1', color: 'bg-purple-600' },
    { party: 'Green', partyKey: 'sidebar.green', seats: partySeats['Green Party'] || 0, change: '0', color: 'bg-party-green' },
  ]

  const consSeats = partySeats['Conservative'] || 0
  const consPct = ((consSeats / totalSeats2015) * 100).toFixed(1)
  const majorityMargin = consSeats - majorityLine2015

  return (
    <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{t('sidebar.national')}</h2>
          <div className="flex items-center text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{t('sidebar.liveUpdates')}</span>
          </div>
        </div>

        {/* 政党席位卡片 */}
        <div className="grid grid-cols-2 gap-2.5">
          {seatData.map((item) => (
            <motion.div
              key={item.party}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-xl p-3 border border-slate-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-2.5 h-2.5 ${item.color} rounded-full`}></div>
                <span className="text-xs text-slate-500">{t(item.partyKey as any)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-slate-800">{item.seats}</div>
                <div className={`text-xs font-medium ${typeof item.change === 'string' && item.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                  {item.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 多数线 */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              <span className="font-semibold text-slate-800 text-sm">{t('sidebar.majorityLine')}</span>
            </div>
            <span className="text-xs text-slate-500">{majorityLine2015} {t('sidebar.needed')}</span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-party-conservative rounded-full"
              style={{ width: `${consPct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{t('sidebar.conSeats')}: {consSeats}</span>
            <span>{t('sidebar.majorityMargin')}: +{majorityMargin}</span>
          </div>
        </div>

        {/* 议会组成图 */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-semibold text-slate-800 text-sm">{t('sidebar.parliament')} ({t('general.y2015')})</span>
          </div>
          <ParliamentChart />
        </div>

        {/* 2015 关键数据 */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-4 h-4 mr-2 text-emerald-600" />
            <span className="font-semibold text-slate-800 text-sm">{t('sidebar.keyStats2015')}</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600">{t('sidebar.consVoteShare')}</span>
                <span className="text-[#0087DC] font-semibold">36.9%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-party-conservative rounded-full" style={{ width: '36.9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600">{t('sidebar.labVoteShare')}</span>
                <span className="text-red-500 font-semibold">30.4%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-party-labour rounded-full" style={{ width: '30.4%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600">{t('sidebar.ukipVoteShare')}</span>
                <span className="text-purple-600 font-semibold">12.6%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '12.6%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('sidebar.nationalTurnout')}</span>
              <span className="font-semibold text-slate-800">{natTurnout.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('sidebar.electorate')}</span>
              <span className="text-slate-700">46.4M</span>
            </div>
          </div>
        </div>

        {/* 底部双列统计 */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="text-xs text-slate-500 mb-1">{t('sidebar.conMajorityStat')}</div>
            <div className="text-lg font-bold text-[#0087DC]">10</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">{t('sidebar.totalSeatsStat')}</div>
            <div className="text-lg font-bold text-slate-700">650</div>
          </div>
        </div>
      </div>
    </div>
  )
}
