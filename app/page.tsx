'use client'
import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
const MapPanel = dynamic(() => import('@/components/map/MapPanel'), { ssr: false })
import FilterPanel from '@/components/filters/FilterPanel'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { Constituency2015 } from '@/lib/data/constituencies-2015-real'

export default function Home() {
  const { t } = useLanguage()
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency2015 | null>(null)
  // 使用单独的触发计数器来区分搜索飞入和地图点击
  const flyTriggerRef = useRef(0)
  const [flyTarget, setFlyTarget] = useState<Constituency2015 | null>(null)

  // 地图点击选区 → 仅更新右侧栏
  const handleMapSelect = useCallback((c: Constituency2015 | null) => {
    setSelectedConstituency(c)
    // 不清除 flyTarget，让之前的飞行动画自然结束
  }, [])

  // 搜索选中选区 → 更新右侧栏 + 飞入地图
  const handleSearchSelect = useCallback((c: Constituency2015 | null) => {
    setSelectedConstituency(c)
    if (c) {
      flyTriggerRef.current += 1
      setFlyTarget({ ...c, _flyTrigger: flyTriggerRef.current } as any)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header onSelectConstituency={handleSearchSelect} />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <FilterPanel />
          <div className="flex-1 relative">
            <MapPanel
              onSelectConstituency={handleMapSelect}
              flyToConstituency={flyTarget}
            />
          </div>
        </div>

        <RightSidebar selectedConstituency={selectedConstituency} />
      </div>

      {/* 状态栏（亮色） */}
      <div className="bg-white border-t border-slate-200 py-2 px-4 text-xs text-slate-500 flex justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            {t('status.live')}
          </span>
          <span className="text-slate-300">|</span>
          <span>{t('status.updated')}: {t('status.source')}</span>
        </div>
        <div>
          <span>{t('status.copyright')}</span>
        </div>
      </div>
    </div>
  )
}
