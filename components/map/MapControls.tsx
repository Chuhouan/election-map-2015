'use client'

import { useMap } from 'react-leaflet'
import { ZoomIn, ZoomOut, Layers, Target, Filter, Download, Eye } from 'lucide-react'
import { useState, ReactNode } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface MapControlsProps {
  nameLabelToggle?: ReactNode
}

export default function MapControls({ nameLabelToggle }: MapControlsProps) {
  const map = useMap()
  const [isSatellite, setIsSatellite] = useState(false)
  const { t } = useLanguage()

  const handleZoomIn = () => map.zoomIn()
  const handleZoomOut = () => map.zoomOut()
  const handleResetView = () => map.setView([54.5, -4], 6)
  const toggleSatellite = () => setIsSatellite(!isSatellite)
  const handleExport = () => {
    map.getContainer().classList.add('exporting')
    // trigger browser print or capture
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="flex flex-col p-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            title={t('controls.zoomIn')}
          >
            <ZoomIn className="w-5 h-5 text-slate-600" />
          </button>
          <div className="h-px bg-slate-200 mx-2"></div>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            title={t('controls.zoomOut')}
          >
            <ZoomOut className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="h-px bg-slate-200"></div>
        <button
          onClick={handleResetView}
          className="p-3 hover:bg-slate-50 w-full transition-colors flex items-center justify-center"
          title={t('controls.resetView')}
        >
          <Target className="w-5 h-5 text-slate-600" />
        </button>

        {nameLabelToggle && (
          <>
            <div className="h-px bg-slate-200"></div>
            {nameLabelToggle}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{t('controls.scale')}</span>
          <span className="text-slate-600">1:1,000,000</span>
        </div>
        <div className="mt-1 h-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full"></div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0</span>
          <span>100 {t('general.km')}</span>
          <span>200 {t('general.km')}</span>
        </div>
      </div>
    </div>
  )
}
