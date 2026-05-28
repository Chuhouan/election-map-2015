import { constituencies, nationalStats, Constituency } from '@/lib/data/constituencies'

export interface ElectionDataService {
  // 选区相关
  getConstituencies: (filters?: ConstituencyFilters) => Constituency[]
  getConstituencyById: (id: number) => Constituency | undefined
  getConstituencyByName: (name: string) => Constituency | undefined
  searchConstituencies: (query: string) => Constituency[]
  
  // 国家统计
  getNationalStats: () => typeof nationalStats
  getPartySeats: () => typeof nationalStats.partySeats
  getPartyVoteShare: () => typeof nationalStats.partyVoteShare
  
  // 分析数据
  getLargestSwings: (count: number) => Constituency[]
  getClosestRaces: (count: number) => Constituency[]
  getSafestSeats: (count: number) => Constituency[]
  getHighestTurnout: (count: number) => Constituency[]
  getBiggestUpsets: (count: number) => Constituency[]
  
  // 地区数据
  getRegionalBreakdown: () => RegionalBreakdown[]
  getNationStats: (nation: string) => NationStats | undefined
}

export interface ConstituencyFilters {
  parties?: string[]
  regions?: string[]
  nations?: string[]
  declared?: boolean
  marginal?: boolean
  minSwing?: number
  maxSwing?: number
  minTurnout?: number
  maxTurnout?: number
  minMajority?: number
  maxMajority?: number
}

export interface RegionalBreakdown {
  name: string
  totalSeats: number
  declaredSeats: number
  partySeats: Record<string, number>
  swing: number
  turnout: number
  keyMarginals: number
}

export interface NationStats {
  name: string
  totalSeats: number
  declaredSeats: number
  turnout: number
  swing: number
  partySeats: Record<string, number>
}

class ElectionDataServiceImpl implements ElectionDataService {
  getConstituencies(filters?: ConstituencyFilters): Constituency[] {
    let result = [...constituencies]
    
    if (filters) {
      if (filters.parties && filters.parties.length > 0) {
        result = result.filter(c => filters.parties!.includes(c.winningParty))
      }
      
      if (filters.regions && filters.regions.length > 0) {
        result = result.filter(c => filters.regions!.includes(c.region))
      }
      
      if (filters.nations && filters.nations.length > 0) {
        result = result.filter(c => filters.nations!.includes(c.nation))
      }
      
      if (filters.declared !== undefined) {
        result = result.filter(c => c.declared === filters.declared)
      }
      
      if (filters.marginal !== undefined) {
        result = result.filter(c => c.marginal === filters.marginal)
      }
      
      if (filters.minSwing !== undefined) {
        result = result.filter(c => c.swing >= filters.minSwing!)
      }
      
      if (filters.maxSwing !== undefined) {
        result = result.filter(c => c.swing <= filters.maxSwing!)
      }
      
      if (filters.minTurnout !== undefined) {
        result = result.filter(c => c.turnout >= filters.minTurnout!)
      }
      
      if (filters.maxTurnout !== undefined) {
        result = result.filter(c => c.turnout <= filters.maxTurnout!)
      }
      
      if (filters.minMajority !== undefined) {
        result = result.filter(c => c.majority >= filters.minMajority!)
      }
      
      if (filters.maxMajority !== undefined) {
        result = result.filter(c => c.majority <= filters.maxMajority!)
      }
    }
    
    return result
  }

  getConstituencyById(id: number): Constituency | undefined {
    return constituencies.find(c => c.id === id)
  }

  getConstituencyByName(name: string): Constituency | undefined {
    return constituencies.find(c => c.name.toLowerCase() === name.toLowerCase())
  }

  searchConstituencies(query: string): Constituency[] {
    const lowerQuery = query.toLowerCase()
    return constituencies.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.winningCandidate.toLowerCase().includes(lowerQuery) ||
      c.region.toLowerCase().includes(lowerQuery)
    )
  }

  getNationalStats() {
    return nationalStats
  }

  getPartySeats() {
    return nationalStats.partySeats
  }

  getPartyVoteShare() {
    return nationalStats.partyVoteShare
  }

  getLargestSwings(count: number): Constituency[] {
    return [...constituencies]
      .filter(c => c.declared)
      .sort((a, b) => Math.abs(b.swing) - Math.abs(a.swing))
      .slice(0, count)
  }

  getClosestRaces(count: number): Constituency[] {
    return [...constituencies]
      .filter(c => c.declared)
      .sort((a, b) => a.majority - b.majority)
      .slice(0, count)
  }

  getSafestSeats(count: number): Constituency[] {
    return [...constituencies]
      .filter(c => c.declared)
      .sort((a, b) => b.majority - a.majority)
      .slice(0, count)
  }

  getHighestTurnout(count: number): Constituency[] {
    return [...constituencies]
      .filter(c => c.declared)
      .sort((a, b) => b.turnout - a.turnout)
      .slice(0, count)
  }

  getBiggestUpsets(count: number): Constituency[] {
    // 这里简化处理：通过历史结果变化来判断意外结果
    return [...constituencies]
      .filter(c => c.declared)
      .map(c => {
        const historicalMajority = c.historicalResults.find(h => h.year === 2019)?.majority || 0
        const upsetMagnitude = Math.abs(c.majority - historicalMajority)
        return { ...c, upsetMagnitude }
      })
      .sort((a, b) => b.upsetMagnitude - a.upsetMagnitude)
      .slice(0, count)
      .map(({ upsetMagnitude, ...c }) => c)
  }

  getRegionalBreakdown(): RegionalBreakdown[] {
    const nations = ['England', 'Scotland', 'Wales', 'Northern Ireland']
    return nations.map(nation => {
      const nationConstituencies = constituencies.filter(c => c.nation === nation)
      const partySeats: Record<string, number> = {}
      
      nationConstituencies.forEach(c => {
        partySeats[c.winningParty] = (partySeats[c.winningParty] || 0) + 1
      })
      
      const totalSeats = {
        England: 543,
        Scotland: 59,
        Wales: 40,
        'Northern Ireland': 18,
      }[nation]!
      
      const declaredSeats = nationConstituencies.filter(c => c.declared).length
      const averageSwing = nationConstituencies.reduce((sum, c) => sum + c.swing, 0) / nationConstituencies.length
      const averageTurnout = nationConstituencies.reduce((sum, c) => sum + c.turnout, 0) / nationConstituencies.length
      const keyMarginals = nationConstituencies.filter(c => c.marginal).length
      
      return {
        name: nation,
        totalSeats,
        declaredSeats,
        partySeats,
        swing: averageSwing,
        turnout: averageTurnout,
        keyMarginals,
      }
    })
  }

  getNationStats(nation: string): NationStats | undefined {
    const breakdown = this.getRegionalBreakdown().find(r => r.name === nation)
    if (!breakdown) return undefined
    
    const nationConstituencies = constituencies.filter(c => c.nation === nation)
    const totalSeats = breakdown.totalSeats
    const declaredSeats = breakdown.declaredSeats
    const turnout = breakdown.turnout
    const swing = breakdown.swing
    
    return {
      name: nation,
      totalSeats,
      declaredSeats,
      turnout,
      swing,
      partySeats: breakdown.partySeats,
    }
  }
}

export const electionDataService: ElectionDataService = new ElectionDataServiceImpl()

// 提供一个用于React Query的钩子
export const useElectionData = () => {
  return {
    constituencies: {
      all: () => electionDataService.getConstituencies(),
      byId: (id: number) => electionDataService.getConstituencyById(id),
      byName: (name: string) => electionDataService.getConstituencyByName(name),
      search: (query: string) => electionDataService.searchConstituencies(query),
      withFilters: (filters: ConstituencyFilters) => electionDataService.getConstituencies(filters),
    },
    national: {
      stats: () => electionDataService.getNationalStats(),
      partySeats: () => electionDataService.getPartySeats(),
      partyVoteShare: () => electionDataService.getPartyVoteShare(),
    },
    analysis: {
      largestSwings: (count: number = 10) => electionDataService.getLargestSwings(count),
      closestRaces: (count: number = 10) => electionDataService.getClosestRaces(count),
      safestSeats: (count: number = 10) => electionDataService.getSafestSeats(count),
      highestTurnout: (count: number = 10) => electionDataService.getHighestTurnout(count),
      biggestUpsets: (count: number = 10) => electionDataService.getBiggestUpsets(count),
    },
    regional: {
      breakdown: () => electionDataService.getRegionalBreakdown(),
      nationStats: (nation: string) => electionDataService.getNationStats(nation),
    },
  }
}