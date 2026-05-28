'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Users, Award } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateParty } from '@/lib/i18n/translations'

interface MapTooltipProps {
  position: { x: number; y: number }
  data: {
    name: string
    region?: string
    party: string
    swing: number
    turnout: number
    majority: number
    voteShare?: number
    color: string
  }
}

export default function MapTooltip({ position, data }: MapTooltipProps) {
  const { t, lang } = useLanguage()
  const [adjustedPos, setAdjustedPos] = useState({ x: 0, y: 0 })
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

  useEffect(() => {
    const tooltipW = 280
    const tooltipH = 200
    const margin = 12

    let x = position.x
    let y = position.y
    let place: 'top' | 'bottom' = 'top'

    // Horizontal boundary
    if (x + tooltipW / 2 > window.innerWidth - margin) {
      x = window.innerWidth - tooltipW / 2 - margin
    }
    if (x - tooltipW / 2 < margin) {
      x = tooltipW / 2 + margin
    }

    // Vertical boundary
    if (y - tooltipH - margin < 0) {
      place = 'bottom'
      y = position.y + 20
    } else {
      y = position.y - 12
    }

    setPlacement(place)
    setAdjustedPos({ x, y })
  }, [position])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: adjustedPos.x,
        top: adjustedPos.y,
        transform: placement === 'top'
          ? 'translate(-50%, calc(-100% - 12px))'
          : 'translate(-50%, 12px)',
      }}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl min-w-64 max-w-[280px]">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center min-w-0">
              <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <h3 className="font-bold text-sm text-slate-800 truncate">{data.name}</h3>
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
              style={{ backgroundColor: data.color }}
            ></div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-400">{t('tooltip.winningParty')}</div>
            <div className="font-medium text-sm text-slate-700">
              {translateParty(data.party, lang)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {t('tooltip.swing')}
              </div>
              <div className={`font-medium text-sm ${data.swing >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.swing >= 0 ? '+' : ''}{typeof data.swing === 'number' ? data.swing.toFixed(1) : data.swing}%
              </div>
            </div>
            <div>
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <Users className="w-3 h-3 mr-1" />
                {t('tooltip.turnout')}
              </div>
              <div className="font-medium text-sm text-slate-700">{data.turnout}%</div>
            </div>
            <div>
              <div className="flex items-center text-xs text-slate-400 mb-1">
                <Award className="w-3 h-3 mr-1" />
                {t('tooltip.majority')}
              </div>
              <div className="font-medium text-sm text-slate-700">{data.majority?.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">{t('tooltip.status')}</div>
              <div className="font-medium text-sm text-green-600">{t('filter.declared')}</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-400 text-center">
              {t('tooltip.clickDetail')}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
