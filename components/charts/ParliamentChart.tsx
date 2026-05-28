'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateParty } from '@/lib/i18n/translations'

export default function ParliamentChart() {
  const { t, lang } = useLanguage()

  const seats = [
    { party: 'Conservative', count: 330, color: '#0087DC' },
    { party: 'Labour', count: 232, color: '#DC241F' },
    { party: 'SNP', count: 56, color: '#F5DC00' },
    { party: 'Lib Dem', count: 8, color: '#FAA61A' },
    { party: 'UKIP', count: 1, color: '#70147A' },
    { party: 'Others', count: 23, color: '#94a3b8' },
  ]

  const totalSeats = 650
  const radius = 60
  const centerX = 70
  const centerY = 70

  let currentAngle = -Math.PI / 2

  return (
    <div className="relative">
      <svg width="140" height="140" className="mx-auto">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="18"
        />

        {seats.map((item, index) => {
          const angle = (item.count / totalSeats) * Math.PI * 2
          const endAngle = currentAngle + angle

          const x1 = centerX + radius * Math.cos(currentAngle)
          const y1 = centerY + radius * Math.sin(currentAngle)
          const x2 = centerX + radius * Math.cos(endAngle)
          const y2 = centerY + radius * Math.sin(endAngle)

          const largeArcFlag = angle > Math.PI ? 1 : 0

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')

          const element = (
            <motion.path
              key={item.party}
              d={pathData}
              fill={item.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          )

          currentAngle = endAngle
          return element
        })}

        <text
          x={centerX}
          y={centerY - 4}
          textAnchor="middle"
          className="text-sm font-bold fill-slate-700"
        >
          650
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-[10px] fill-slate-400"
        >
          {lang === 'zh' ? '席位' : 'seats'}
        </text>
      </svg>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {seats.map((item) => (
          <div key={item.party} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-700 truncate">
                {lang === 'zh' ? translateParty(item.party, 'zh') : item.party}
              </div>
              <div className="text-[10px] text-slate-400">{item.count} {t('general.seats')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
