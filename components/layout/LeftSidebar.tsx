'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateConName } from '@/lib/data/name-translations'
import constituencyData from '@/lib/data/constituencies-2015-real'
import { PARTY_COLORS_2015 } from '@/lib/data/constituencies-2015-real'
import { Target, Shield, Zap } from 'lucide-react'

const TOTAL = 650
const MAJORITY = 326

export default function LeftSidebar() {
  const { t, lang } = useLanguage()
  const isZh = lang === 'zh'

  // Compute party stats from real data
  const partyStats = (() => {
    const seats: Record<string, number> = {}
    const votes: Record<string, number> = {}
    let totalVotes = 0
    constituencyData.forEach(c => {
      seats[c.winner] = (seats[c.winner] || 0) + 1
      c.candidates.forEach(cand => {
        votes[cand.party] = (votes[cand.party] || 0) + cand.votes
        totalVotes += cand.votes
      })
    })

    const all = [
      { key: 'Conservative', label: t('sidebar.con') },
      { key: 'Labour', label: t('sidebar.lab') },
      { key: 'SNP', label: t('sidebar.snp') },
      { key: 'Liberal Democrat', label: t('sidebar.libdem') },
      { key: 'UKIP', label: t('sidebar.ukip') },
      { key: 'Green Party', label: t('sidebar.green') },
    ]

    return all.map(p => ({
      ...p,
      seats: seats[p.key] || 0,
      votes: votes[p.key] || 0,
      pct: totalVotes > 0 ? ((votes[p.key] || 0) / totalVotes * 100).toFixed(1) : '0.0',
      color: {
        'Conservative': '#0087DC',
        'Labour': '#DC241F',
        'SNP': '#F5DC00',
        'Liberal Democrat': '#FAA61A',
        'UKIP': '#70147A',
        'Green Party': '#6AB023',
      }[p.key] || '#888',
    })).sort((a, b) => b.seats - a.seats)
  })()

  const maxSeats = Math.max(...partyStats.map(p => p.seats), 1)
  const consSeats = partyStats.find(p => p.key === 'Conservative')?.seats || 0

  return (
    <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-4 space-y-4">

        {/* === Top Summary === */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {t('sidebar.national')}
            </h2>
            <span className="text-[11px] text-slate-400">2015</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase">{t('sidebar.totalSeatsStat')}</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">650</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase">{t('sidebar.conMajorityStat')}</div>
              <div className="text-2xl font-bold text-[#0087DC] mt-0.5">+{consSeats - MAJORITY}</div>
            </div>
          </div>
        </div>

        {/* === Majority Bar === */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500">{t('sidebar.majorityLine')}</span>
            <span className="text-[11px] text-slate-400">{MAJORITY} {t('sidebar.needed')}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
            <div className="h-full bg-[#0087DC] rounded-full" style={{ width: `${Math.min((consSeats / TOTAL) * 100, 100)}%` }} />
            <div className="absolute top-0 bottom-0 border-r-2 border-red-400" style={{ left: `${(MAJORITY / TOTAL) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
            <span>{consSeats} {t('general.seats')}</span>
            <span>{MAJORITY} {t('general.majority')}</span>
          </div>
        </div>

        {/* === Key Battlegrounds === */}
        {(() => {
          const marginals = constituencyData
            .map(c => ({ name: c.name, winner: c.winner, majority: c.majority, totalVotes: c.totalVotes, turnout: c.turnout }))
            .sort((a, b) => a.majority - b.majority)
          const top3 = marginals.slice(0, 3)
          return (
            <div>
              <div className="flex items-center mb-2">
                <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t('general.keyBattlegrounds')}</h3>
              </div>
              <div className="space-y-1.5">
                {top3.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-red-50 rounded-md px-2.5 py-1.5">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-slate-700 truncate block">{isZh ? translateConName(s.name) : s.name}</span>
                      <span className="text-[9px] text-red-500">{t('general.maj')} {s.majority.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 ml-2">
                      {s.winner === 'Conservative'
                        ? t('general.con')
                        : s.winner === 'Labour'
                          ? t('general.lab')
                          : s.winner === 'Liberal Democrat'
                            ? t('general.libdem')
                            : s.winner === 'SNP'
                              ? t('general.snp')
                              : s.winner.slice(0, 3).toUpperCase()}
                      {' '}{t('general.gain')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* === Party Results Table === */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('sidebar.parliament')}
          </h3>
          <div className="space-y-1">
            {partyStats.map((party) => (
              <div
                key={party.key}
                className={`flex items-center rounded-lg p-2.5 transition-colors ${
                  party.key === 'Conservative' ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                {/* Party color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mr-3"
                  style={{ backgroundColor: party.color }}
                />
                {/* Party name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-slate-800">{party.label}</span>
                    <span className="text-sm text-slate-400">{party.pct}%</span>
                  </div>
                  {/* Seat bar */}
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(party.seats / maxSeats) * 100}%`,
                        backgroundColor: party.color,
                      }}
                    />
                  </div>
                </div>
                {/* Seats number */}
                <div className="ml-3 text-right flex-shrink-0 w-10">
                  <span className="text-base font-bold text-slate-900">{party.seats}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
            <span>{t('general.partiesShown').replace('{n}', '6')}</span>
            <span>{TOTAL} {t('general.constituencies')} · 2015</span>
          </div>
        </div>

      </div>
    </div>
  )
}
