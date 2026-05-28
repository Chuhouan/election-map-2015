'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateParty } from '@/lib/i18n/translations'

interface SwingometerProps {
  swing: number
  fromParty?: string
  toParty?: string
}

export default function Swingometer({ swing = 3.2, fromParty = 'Conservative', toParty = 'Labour' }: SwingometerProps) {
  const { lang } = useLanguage()
  const isZh = lang === 'zh'
  const maxSwing = 20
  const swingNormalized = Math.min(Math.max(swing, -maxSwing), maxSwing)
  const angle = (swingNormalized / maxSwing) * 90

  const isPositive = swing >= 0
  const swingColor = isPositive ? '#DC241F' : '#0087DC'

  const fromLabel = isZh ? translateParty(fromParty, 'zh') : fromParty
  const toLabel = isZh ? translateParty(toParty, 'zh') : toParty

  return (
    <div className="relative">
      <div className="relative h-40 mx-auto w-64">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* 背景弧 */}
          <path
            d="M 20,80 A 80,80 0 0,1 180,80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* 左侧（工党）弧段 */}
          <path
            d="M 20,80 A 80,80 0 0,1 100,20"
            fill="none"
            stroke="#DC241F"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="3,3"
            opacity="0.5"
          />

          {/* 右侧（保守党）弧段 */}
          <path
            d="M 100,20 A 80,80 0 0,1 180,80"
            fill="none"
            stroke="#0087DC"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="3,3"
            opacity="0.5"
          />

          {/* 刻度线 */}
          {Array.from({ length: 9 }).map((_, i) => {
            const tickAngle = -90 + (i * 22.5)
            const x1 = 100 + 75 * Math.cos(tickAngle * Math.PI / 180)
            const y1 = 80 + 75 * Math.sin(tickAngle * Math.PI / 180)
            const x2 = 100 + 65 * Math.cos(tickAngle * Math.PI / 180)
            const y2 = 80 + 65 * Math.sin(tickAngle * Math.PI / 180)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            )
          })}

          {/* 指针 */}
          <motion.line
            x1="100"
            y1="80"
            x2={100 + 60 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={80 + 60 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke={swingColor}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ rotate: 0 }}
            animate={{ rotate: angle }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />

          {/* 指针头 */}
          <motion.circle
            cx="100"
            cy="80"
            r="4"
            fill={swingColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />

          {/* 中心点 */}
          <circle cx="100" cy="80" r="3" fill="#334155" />
        </svg>

        {/* 标签 */}
        <div className="absolute top-4 left-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-party-labour rounded-full mr-1"></div>
            <span className="text-slate-600">{toLabel}</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 text-xs">
          <div className="flex items-center justify-end">
            <span className="text-slate-600">{fromLabel}</span>
            <div className="w-3 h-3 bg-party-conservative rounded-full ml-1"></div>
          </div>
        </div>
      </div>

      {/* 摇摆数值显示 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-4"
      >
        <div className="text-2xl font-bold mb-1" style={{ color: swingColor }}>
          {swing > 0 ? '+' : ''}{swing}%
        </div>
        <div className="text-sm text-slate-500">
          {isPositive ? `${fromLabel} → ${toLabel}` : `${toLabel} → ${fromLabel}`}
        </div>
      </motion.div>

      {/* 刻度标签 */}
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-4">
        <span>-20%</span>
        <span>-10%</span>
        <span className="text-slate-500 font-medium">0%</span>
        <span>+10%</span>
        <span>+20%</span>
      </div>
    </div>
  )
}
