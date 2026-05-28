import { create } from 'zustand'
import { Constituency, constituencies } from '@/lib/data/constituencies'

interface ElectionState {
  // 选区选择
  selectedConstituencyId: number | null
  selectedConstituency: Constituency | null
  
  // 地图状态
  mapView: {
    center: [number, number]
    zoom: number
  }
  mapMode: 'seats' | 'swing' | 'margin' | 'turnout'
  
  // 过滤器
  filters: {
    parties: string[]
    regions: string[]
    nations: string[]
    minSwing: number
    maxSwing: number
    minTurnout: number
    maxTurnout: number
    minMajority: number
    maxMajority: number
    declaredOnly: boolean
    marginalOnly: boolean
  }
  
  // UI状态
  sidebarOpen: boolean
  filterPanelOpen: boolean
  replayMode: boolean
  replayProgress: number
  
  // 操作
  selectConstituency: (id: number | null) => void
  setMapView: (center: [number, number], zoom: number) => void
  setMapMode: (mode: 'seats' | 'swing' | 'margin' | 'turnout') => void
  updateFilters: (updates: Partial<ElectionState['filters']>) => void
  resetFilters: () => void
  toggleSidebar: () => void
  toggleFilterPanel: () => void
  setReplayMode: (enabled: boolean) => void
  setReplayProgress: (progress: number) => void
}

const defaultFilters = {
  parties: ['Labour', 'Conservative', 'Liberal Democrat', 'SNP', 'Green', 'DUP', 'SinnFein', 'PlaidCymru', 'Others'],
  regions: [],
  nations: [],
  minSwing: -20,
  maxSwing: 20,
  minTurnout: 0,
  maxTurnout: 100,
  minMajority: 0,
  maxMajority: 100000,
  declaredOnly: true,
  marginalOnly: false,
}

export const useElectionStore = create<ElectionState>((set, get) => ({
  // 初始状态
  selectedConstituencyId: null,
  selectedConstituency: null,
  
  mapView: {
    center: [54.5, -4] as [number, number],
    zoom: 6,
  },
  
  mapMode: 'seats',
  
  filters: { ...defaultFilters },
  
  sidebarOpen: true,
  filterPanelOpen: false,
  replayMode: false,
  replayProgress: 0,
  
  // 操作实现
  selectConstituency: (id) => {
    if (id === null) {
      set({ selectedConstituencyId: null, selectedConstituency: null })
      return
    }
    
    const constituency = constituencies.find(c => c.id === id)
    if (constituency) {
      set({ 
        selectedConstituencyId: id,
        selectedConstituency: constituency,
        mapView: {
          center: [constituency.coordinates.lat, constituency.coordinates.lng],
          zoom: 10,
        },
      })
    }
  },
  
  setMapView: (center, zoom) => {
    set({ mapView: { center, zoom } })
  },
  
  setMapMode: (mode) => {
    set({ mapMode: mode })
  },
  
  updateFilters: (updates) => {
    set((state) => ({ 
      filters: { ...state.filters, ...updates } 
    }))
  },
  
  resetFilters: () => {
    set({ filters: { ...defaultFilters } })
  },
  
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },
  
  toggleFilterPanel: () => {
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen }))
  },
  
  setReplayMode: (enabled) => {
    set({ replayMode: enabled })
  },
  
  setReplayProgress: (progress) => {
    set({ replayProgress: Math.max(0, Math.min(1, progress)) })
  },
}))

// 派生选择器
export const electionSelectors = {
  // 过滤后的选区
  filteredConstituencies: () => {
    const { filters } = useElectionStore.getState()
    let filtered = [...constituencies]
    
    if (filters.parties.length > 0) {
      filtered = filtered.filter(c => filters.parties.includes(c.winningParty))
    }
    
    if (filters.regions.length > 0) {
      filtered = filtered.filter(c => filters.regions.includes(c.region))
    }
    
    if (filters.nations.length > 0) {
      filtered = filtered.filter(c => filters.nations.includes(c.nation))
    }
    
    if (filters.declaredOnly) {
      filtered = filtered.filter(c => c.declared)
    }
    
    if (filters.marginalOnly) {
      filtered = filtered.filter(c => c.marginal)
    }
    
    filtered = filtered.filter(c => 
      c.swing >= filters.minSwing && 
      c.swing <= filters.maxSwing &&
      c.turnout >= filters.minTurnout &&
      c.turnout <= filters.maxTurnout &&
      c.majority >= filters.minMajority &&
      c.majority <= filters.maxMajority
    )
    
    return filtered
  },
  
  // 根据地图模式获取选区颜色
  getConstituencyColor: (constituency: Constituency, mode: 'seats' | 'swing' | 'margin' | 'turnout') => {
    switch (mode) {
      case 'seats':
        const partyColors: Record<string, string> = {
          'Labour': '#DC241F',
          'Conservative': '#0087DC',
          'Liberal Democrat': '#FAA61A',
          'SNP': '#FFFF00',
          'Green': '#6AB023',
          'DUP': '#D46A4C',
          'SinnFein': '#328328',
          'PlaidCymru': '#3F842C',
          'Others': '#777777',
        }
        return partyColors[constituency.winningParty] || '#777777'
        
      case 'swing':
        // 摇摆：红色表示工党增益，蓝色表示保守党增益
        if (constituency.swing > 0) {
          // 工党增益：红色渐变
          const intensity = Math.min(1, Math.abs(constituency.swing) / 20)
          return `rgb(220, ${36 + (219 * (1 - intensity))}, ${31 + (224 * (1 - intensity))})`
        } else {
          // 保守党增益：蓝色渐变
          const intensity = Math.min(1, Math.abs(constituency.swing) / 20)
          return `rgb(${0 + (255 * (1 - intensity))}, ${135 + (120 * (1 - intensity))}, 220)`
        }
        
      case 'margin':
        // 多数：越安全颜色越深
        const safeThreshold = 10000
        const safety = Math.min(1, constituency.majority / safeThreshold)
        if (constituency.winningParty === 'Labour') {
          return `rgb(220, ${36 + (180 * (1 - safety))}, ${31 + (180 * (1 - safety))})`
        } else if (constituency.winningParty === 'Conservative') {
          return `rgb(0, ${135 + (120 * (1 - safety))}, 220)`
        } else {
          return '#777777'
        }
        
      case 'turnout':
        // 投票率：越高颜色越亮
        const turnoutNormalized = (constituency.turnout - 50) / 40 // 假设50-90%范围
        const brightness = Math.max(0.3, Math.min(1, turnoutNormalized))
        return `rgb(${Math.floor(32 * brightness)}, ${Math.floor(168 * brightness)}, ${Math.floor(243 * brightness)})`
        
      default:
        return '#777777'
    }
  },
  
  // 国家统计
  nationalStats: () => {
    const filtered = electionSelectors.filteredConstituencies()
    const total = filtered.length
    const declared = filtered.filter(c => c.declared).length
    
    const partySeats: Record<string, number> = {}
    filtered.forEach(c => {
      if (c.declared) {
        partySeats[c.winningParty] = (partySeats[c.winningParty] || 0) + 1
      }
    })
    
    const averageSwing = filtered.length > 0 
      ? filtered.reduce((sum, c) => sum + c.swing, 0) / filtered.length
      : 0
    
    const averageTurnout = filtered.length > 0
      ? filtered.reduce((sum, c) => sum + c.turnout, 0) / filtered.length
      : 0
    
    return {
      total,
      declared,
      partySeats,
      averageSwing,
      averageTurnout,
    }
  },
}