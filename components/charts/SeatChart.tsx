'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateParty } from '@/lib/i18n/translations'

interface SeatChartProps {
  data?: Array<{
    party: string
    seats: number
    change: number
    color: string
  }>
}

export default function SeatChart({ data }: SeatChartProps) {
  const { t, lang } = useLanguage()

  const defaultData = [
    { party: 'Labour', seats: 275, change: +45, color: 'bg-party-labour' },
    { party: 'Conservative', seats: 180, change: -60, color: 'bg-party-conservative' },
    { party: 'Lib Dem', seats: 78, change: +25, color: 'bg-party-libdem' },
    { party: 'SNP', seats: 52, change: -5, color: 'bg-party-snp' },
    { party: 'Green', seats: 24, change: +8, color: 'bg-party-green' },
    { party: 'Others', seats: 41, change: -13, color: 'bg-party-other' },
  ]

  const chartData = data || defaultData
  const maxSeats = Math.max(...chartData.map(d => d.seats))

  return (
    <div className="space-y-2">
      {chartData.map((item, index) => (
        <motion.div
          key={item.party}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center space-x-3"
        >
          <div className="w-16 text-right">
            <div className="text-sm font-medium text-slate-700">
              {lang === 'zh' ? translateParty(item.party, 'zh') : item.party}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{item.seats} {t('general.seats')}</span>
              <span className={`text-xs font-medium ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}
              </span>
            </div>

            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${item.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${(item.seats / maxSeats) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
