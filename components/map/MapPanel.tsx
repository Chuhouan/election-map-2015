'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GeoJSON, TileLayer, ZoomControl } from 'react-leaflet'
import { LeafletProvider, createLeafletContext } from '@react-leaflet/core'
import type { LeafletContextInterface } from '@react-leaflet/core'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Eye, EyeOff } from 'lucide-react'
import MapControls from './MapControls'
import MapTooltip from './MapTooltip'
import constituencyData, { type Constituency2015, PARTY_COLORS_2015 } from '@/lib/data/constituencies-2015-real'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const allConstituenciesCount = 650

// UK bounding box
const UK_BOUNDS: L.LatLngBoundsLiteral = [
  [49.7, -10.5],
  [61.0, 2.0],
]

// ============================================================
// 精细颜色梯度
// ============================================================

/** 优势模式：10级梯度，从极端安全到极度边缘 */
function getMarginColor(majority: number): string {
  if (majority > 25000) return '#67001f'
  if (majority > 20000) return '#b2182b'
  if (majority > 15000) return '#d6604d'
  if (majority > 10000) return '#f4a582'
  if (majority > 7000) return '#fddbc7'
  if (majority > 5000) return '#e0e0e0'
  if (majority > 3000) return '#c7eae5'
  if (majority > 1500) return '#80cdc1'
  if (majority > 500) return '#35978f'
  return '#01665e'
}

/** 投票率模式：11级梯度 */
function getTurnoutColor(turnout: number): string {
  if (turnout >= 80) return '#004529'
  if (turnout >= 77) return '#006837'
  if (turnout >= 74) return '#238443'
  if (turnout >= 71) return '#41ab5d'
  if (turnout >= 68) return '#78c679'
  if (turnout >= 65) return '#addd8e'
  if (turnout >= 62) return '#d9f0a3'
  if (turnout >= 58) return '#fee391'
  if (turnout >= 54) return '#fec44f'
  if (turnout >= 50) return '#fe9929'
  return '#d95f0e'
}

// ============================================================
// 子组件：名称标签切换器
// ============================================================
function NameLabelToggle({ showNames, onToggle }: { showNames: boolean; onToggle: () => void }) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onToggle}
      className={`p-3 w-full transition-colors flex items-center justify-center ${
        showNames ? 'bg-blue-50' : 'hover:bg-slate-50'
      }`}
      title={showNames ? t('map.hideNames') : t('map.showNames')}
    >
      {showNames ? (
        <EyeOff className={`w-5 h-5 text-blue-600`} />
      ) : (
        <Eye className="w-5 h-5 text-slate-600" />
      )}
    </button>
  )
}

interface MapPanelProps {
  onSelectConstituency?: (c: Constituency2015 | null) => void
  flyToConstituency?: Constituency2015 | null
}

export default function MapPanel({ onSelectConstituency, flyToConstituency }: MapPanelProps) {
  const { t } = useLanguage()
  const [mapMode, setMapMode] = useState<'seats' | 'margin' | 'turnout'>('seats')
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [tooltipData, setTooltipData] = useState<any>(null)
  const [context, setContext] = useState<LeafletContextInterface | null>(null)
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState<any>(null)
  const [loadingBoundaries, setLoadingBoundaries] = useState(true)
  const [showNames, setShowNames] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(6)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const lastFlownIdRef = useRef<number | null>(null)
  const labelRefs = useRef<Map<string, L.Tooltip>>(new Map())

  // 根据 zoom 计算字体大小：缩小视图标签更小，放大后逐渐变大
  // zoom < 7 时隐藏标签（避免缩小视图时杂糅）
  const getLabelStyle = useCallback((zoom: number) => {
    if (zoom < 7) return { fontSize: 8, opacity: 0 }
    // 从 zoom=7 开始显示，字体随放大指数增长
    const fontSize = Math.round(Math.max(8, Math.min(22, 8 * Math.pow(1.18, zoom - 7))))
    const opacity = zoom === 7 ? 0.65 : 1
    return { fontSize, opacity }
  }, [])

  // Load boundary GeoJSON data
  useEffect(() => {
    fetch('/data/constituency-boundaries-merged.json')
      .then(res => res.json())
      .then(data => {
        setBoundaryGeoJSON(data)
        setLoadingBoundaries(false)
      })
      .catch(err => {
        console.error('Failed to load boundary GeoJSON:', err)
        setLoadingBoundaries(false)
      })
  }, [])

  // Initialize map
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id
    }

    if (mapRef.current) return

    const map = L.map(container, {
      center: [54.5, -4],
      zoom: 6,
      zoomControl: false,
      minZoom: 5,
      maxZoom: 12,
      maxBounds: UK_BOUNDS,
      maxBoundsViscosity: 0.8,
    })

    mapRef.current = map

    // 追踪 zoom 级别，用于动态缩放标签
    setCurrentZoom(map.getZoom())
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom())
    })

    const ctx = createLeafletContext(map)
    setContext(ctx)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      setContext(null)
    }
  }, [])

  // Search fly-to effect
  useEffect(() => {
    if (flyToConstituency && mapRef.current && flyToConstituency.id !== lastFlownIdRef.current) {
      lastFlownIdRef.current = flyToConstituency.id
      mapRef.current.flyTo([flyToConstituency.lat, flyToConstituency.lng], 10, {
        duration: 1.5,
      })
      const found = constituencyData.find(c => c.id === flyToConstituency.id)
      if (found && onSelectConstituency) {
        onSelectConstituency(found)
      }
    }
  }, [flyToConstituency])

  const getPartyColor = useCallback((party: string) => {
    if (PARTY_COLORS_2015[party]) return PARTY_COLORS_2015[party]
    switch (party) {
      case 'Labour': return '#DC241F'
      case 'Conservative': return '#0087DC'
      case 'Liberal Democrat': return '#FAA61A'
      case 'SNP': return '#FFD700'
      case 'Green Party': return '#6AB023'
      case 'UKIP': return '#70147A'
      case 'DUP': return '#D46A4C'
      case 'Sinn Fein': return '#328328'
      case 'Plaid Cymru': return '#3F8428'
      case 'SDLP': return '#2AA82C'
      case 'UUP': return '#48A5EE'
      case 'Alliance': return '#F6CB2F'
      case 'TUV': return '#0C3B73'
      case 'Speaker': return '#808080'
      case 'Independent': return '#C0C0C0'
      case 'Respect': return '#72287D'
      default: return '#777777'
    }
  }, [])

  const getFeatureColor = useCallback((props: any) => {
    switch (mapMode) {
      case 'seats':
        return getPartyColor(props.party)
      case 'margin':
        return getMarginColor(props.majority)
      case 'turnout':
        return getTurnoutColor(props.turnout)
      default:
        return getPartyColor(props.party)
    }
  }, [mapMode, getPartyColor])

  // Polygon style function
  const polygonStyle = useCallback((feature: any) => {
    const color = getFeatureColor(feature.properties)
    return {
      fillColor: color,
      fillOpacity: 0.78,
      color: '#ffffff',
      weight: 0.6,
      opacity: 0.5,
    }
  }, [getFeatureColor])

  // 根据 zoom 级别动态调整标签字体和可见性
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const { fontSize, opacity } = getLabelStyle(currentZoom)
    container.style.setProperty('--label-font-size', `${fontSize}px`)
    container.style.setProperty('--label-opacity', String(opacity))
  }, [currentZoom, getLabelStyle])

  // Handle showNames toggling
  useEffect(() => {
    if (!boundaryGeoJSON) return
    labelRefs.current.forEach((tooltip) => {
      tooltip.remove()
    })
    labelRefs.current.clear()
  }, [boundaryGeoJSON, showNames, mapMode])

  const onEachFeature = useCallback((feature: any, layer: any) => {
    // Add or update name labels
    if (showNames) {
      const nameKey = feature.properties.name || feature.properties.boundaryName
      const displayName = nameKey || ''
      const tooltip = layer.bindTooltip(displayName, {
        permanent: true,
        direction: 'center',
        className: 'constituency-name-label',
        opacity: 0.85,
        interactive: false,
      } as any)
      labelRefs.current.set(String(feature.properties.code || Math.random()), tooltip)
    }

    layer.on({
      mouseover: (e: any) => {
        layer.setStyle({
          weight: 2.5,
          color: '#1e293b',
          fillOpacity: 0.95,
          opacity: 1,
        })
        layer.bringToFront()

        const props = feature.properties
        setTooltipData({
          name: props.name,
          region: props.region,
          party: props.party,
          swing: props.swing,
          turnout: props.turnout,
          majority: props.majority,
          voteShare: props.voteShare,
          color: getFeatureColor(props),
        })

        const { clientX, clientY } = e.originalEvent
        setTooltipPosition({ x: clientX, y: clientY })
      },
      mouseout: () => {
        const color = getFeatureColor(feature.properties)
        layer.setStyle({
          weight: 0.6,
          color: '#ffffff',
          fillOpacity: 0.78,
          fillColor: color,
          opacity: 0.5,
        })
        setTooltipPosition(null)
        setTooltipData(null)
      },
      click: () => {
        const props = feature.properties
        const found = constituencyData.find(c => c.name === props.name)
        if (found && onSelectConstituency) {
          onSelectConstituency(found)
        }
      },
    })
  }, [getFeatureColor, onSelectConstituency, showNames])

  const modeLabels: Record<string, string> = {
    seats: t('map.seats'),
        margin: t('map.margin'),
    turnout: t('map.turnout'),
  }

  return (
    <div className="relative w-full h-full">
      {/* 顶部左侧：地图模式选择器 + 名称开关 */}
      <div className="absolute top-3 left-3 z-[1000] flex space-x-2">
        <div className="flex space-x-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-slate-200">
          {(['seats', 'margin', 'turnout'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mapMode === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>

        {/* 名称显示开关 */}
        <button
          onClick={() => setShowNames(!showNames)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border shadow-sm ${
            showNames
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title={showNames ? t('map.hideNames') : t('map.showNames')}
        >
          {showNames ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showNames ? t('map.hideNames') : t('map.showNames')}</span>
        </button>
      </div>

      {/* 选区计数 */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-slate-500 border border-slate-200 shadow-sm">
        {allConstituenciesCount} {t('general.seats')} · {t('general.y2015')}
      </div>

      {/* 地图容器 */}
      <div className="w-full h-full">
        <div
          ref={containerRef}
          style={{ height: '100%', width: '100%', background: '#e8ecf1' }}
        >
          {context && (
            <LeafletProvider value={context}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {boundaryGeoJSON && !loadingBoundaries && (
                <GeoJSON
                  key={`${mapMode}-${showNames}`}
                  data={boundaryGeoJSON}
                  style={polygonStyle}
                  onEachFeature={onEachFeature}
                />
              )}
              <ZoomControl position="bottomright" />
              <MapControls nameLabelToggle={
                <NameLabelToggle showNames={showNames} onToggle={() => setShowNames(!showNames)} />
              } />
            </LeafletProvider>
          )}

          {loadingBoundaries && context && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-[500]">
              <div className="bg-white rounded-xl px-6 py-4 shadow-lg border border-slate-200 text-sm text-slate-600">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('status.loadingBoundaries')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 工具提示 */}
      {tooltipPosition && tooltipData && (
        <MapTooltip
          position={tooltipPosition}
          data={tooltipData}
        />
      )}

      {/* 选区详情已移至右侧栏，此处不再弹出小窗口 */}

      {/* 细化图例 */}
      {mapMode !== 'seats' && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200 shadow-sm">
          {mapMode === 'swing' && (
            <div>
              <div className="text-[10px] text-slate-500 mb-1.5 font-medium">{t('map.legendSwingRange')}</div>
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[
                    { color: '#990000', label: '-20%' },
                    { color: '#d7301f', label: '-15' },
                    { color: '#fc8d59', label: '-10' },
                    { color: '#fdbb84', label: '-5' },
                    { color: '#ffffcc', label: '0' },
                    { color: '#a1d99b', label: '+5' },
                    { color: '#74c476', label: '+10' },
                    { color: '#41ab5d', label: '+15' },
                    { color: '#005a32', label: '+20%' },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center mx-0.5">
                      <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: s.color }}></div>
                      <span className="text-[9px] text-slate-500 mt-0.5">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                <span>{t('map.legendSwingConGain')}</span>
                <span>{t('map.legendSwingLabGain')}</span>
              </div>
            </div>
          )}
          {mapMode === 'margin' && (
            <div>
              <div className="text-[10px] text-slate-500 mb-1.5 font-medium">{t('map.legendMarginRange')}</div>
              <div className="flex items-center space-x-1">
                {[
                  { color: '#01665e', label: '0' },
                  { color: '#35978f', label: '500' },
                  { color: '#80cdc1', label: '1.5K' },
                  { color: '#e0e0e0', label: '5K' },
                  { color: '#f4a582', label: '10K' },
                  { color: '#d6604d', label: '15K' },
                  { color: '#b2182b', label: '20K' },
                  { color: '#67001f', label: '25K+' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center mx-0.5">
                    <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: s.color }}></div>
                    <span className="text-[9px] text-slate-500 mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                <span>{t('map.legendMarginMarginal')}</span>
                <span>{t('map.legendMarginSafe')}</span>
              </div>
            </div>
          )}
          {mapMode === 'turnout' && (
            <div>
              <div className="text-[10px] text-slate-500 mb-1.5 font-medium">{t('map.legendTurnoutRange')}</div>
              <div className="flex items-center space-x-1">
                {[
                  { color: '#d95f0e', label: '<50' },
                  { color: '#fec44f', label: '54' },
                  { color: '#d9f0a3', label: '62' },
                  { color: '#addd8e', label: '65' },
                  { color: '#78c679', label: '68' },
                  { color: '#41ab5d', label: '71' },
                  { color: '#238443', label: '74' },
                  { color: '#006837', label: '77' },
                  { color: '#004529', label: '80+' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center mx-0.5">
                    <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: s.color }}></div>
                    <span className="text-[9px] text-slate-500 mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                <span>{t('map.legendTurnoutLow')}</span>
                <span>{t('map.legendTurnoutHigh')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
