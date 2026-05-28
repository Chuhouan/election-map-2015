import { useQuery } from '@tanstack/react-query'
import { electionDataService } from '@/lib/services/electionData'
import { useElectionStore, electionSelectors } from '@/lib/store/electionStore'

export function useConstituencies() {
  const filters = useElectionStore((state) => state.filters)
  
  return useQuery({
    queryKey: ['constituencies', filters],
    queryFn: () => electionDataService.getConstituencies(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

export function useConstituency(id: number | null) {
  return useQuery({
    queryKey: ['constituency', id],
    queryFn: () => id ? electionDataService.getConstituencyById(id) : null,
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2分钟
  })
}

export function useNationalStats() {
  return useQuery({
    queryKey: ['national-stats'],
    queryFn: () => electionDataService.getNationalStats(),
    staleTime: 1 * 60 * 1000, // 1分钟
  })
}

export function usePartySeats() {
  return useQuery({
    queryKey: ['party-seats'],
    queryFn: () => electionDataService.getPartySeats(),
    staleTime: 1 * 60 * 1000,
  })
}

export function useLargestSwings(count: number = 10) {
  return useQuery({
    queryKey: ['largest-swings', count],
    queryFn: () => electionDataService.getLargestSwings(count),
    staleTime: 2 * 60 * 1000,
  })
}

export function useClosestRaces(count: number = 10) {
  return useQuery({
    queryKey: ['closest-races', count],
    queryFn: () => electionDataService.getClosestRaces(count),
    staleTime: 2 * 60 * 1000,
  })
}

export function useSafestSeats(count: number = 10) {
  return useQuery({
    queryKey: ['safest-seats', count],
    queryFn: () => electionDataService.getSafestSeats(count),
    staleTime: 2 * 60 * 1000,
  })
}

export function useHighestTurnout(count: number = 10) {
  return useQuery({
    queryKey: ['highest-turnout', count],
    queryFn: () => electionDataService.getHighestTurnout(count),
    staleTime: 2 * 60 * 1000,
  })
}

export function useRegionalBreakdown() {
  return useQuery({
    queryKey: ['regional-breakdown'],
    queryFn: () => electionDataService.getRegionalBreakdown(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useRealtimeUpdates() {
  // 模拟实时更新
  return useQuery({
    queryKey: ['realtime-updates'],
    queryFn: async () => {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 随机更新一些选区状态
      return {
        timestamp: new Date().toISOString(),
        newDeclarations: Math.floor(Math.random() * 5),
        updatedConstituencies: Math.floor(Math.random() * 10),
      }
    },
    refetchInterval: 30 * 1000, // 每30秒刷新
    staleTime: 10 * 1000, // 10秒后标记为过时
  })
}

// 派生状态钩子
export function useFilteredConstituencies() {
  const filters = useElectionStore((state) => state.filters)
  const { data: allConstituencies } = useConstituencies()
  
  if (!allConstituencies) return []
  
  return allConstituencies.filter(constituency => {
    // 应用与store中相同的过滤器逻辑
    if (filters.parties.length > 0 && !filters.parties.includes(constituency.winningParty)) {
      return false
    }
    
    if (filters.regions.length > 0 && !filters.regions.includes(constituency.region)) {
      return false
    }
    
    if (filters.nations.length > 0 && !filters.nations.includes(constituency.nation)) {
      return false
    }
    
    if (filters.declaredOnly && !constituency.declared) {
      return false
    }
    
    if (filters.marginalOnly && !constituency.marginal) {
      return false
    }
    
    if (constituency.swing < filters.minSwing || constituency.swing > filters.maxSwing) {
      return false
    }
    
    if (constituency.turnout < filters.minTurnout || constituency.turnout > filters.maxTurnout) {
      return false
    }
    
    if (constituency.majority < filters.minMajority || constituency.majority > filters.maxMajority) {
      return false
    }
    
    return true
  })
}

export function useCurrentNationalStats() {
  const filteredConstituencies = useFilteredConstituencies()
  
  const total = filteredConstituencies.length
  const declared = filteredConstituencies.filter(c => c.declared).length
  
  const partySeats: Record<string, number> = {}
  filteredConstituencies.forEach(c => {
    if (c.declared) {
      partySeats[c.winningParty] = (partySeats[c.winningParty] || 0) + 1
    }
  })
  
  const averageSwing = filteredConstituencies.length > 0 
    ? filteredConstituencies.reduce((sum, c) => sum + c.swing, 0) / filteredConstituencies.length
    : 0
  
  const averageTurnout = filteredConstituencies.length > 0
    ? filteredConstituencies.reduce((sum, c) => sum + c.turnout, 0) / filteredConstituencies.length
    : 0
  
  return {
    total,
    declared,
    partySeats,
    averageSwing,
    averageTurnout,
  }
}