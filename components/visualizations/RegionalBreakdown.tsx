'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Map } from 'lucide-react'

interface RegionData {
  name: string
  totalSeats: number
  declared: number
  seats: {
    party: string
    count: number
    change: number
  }[]
  swing: number
  turnout: number
  keyMarginals: number
}

export default function RegionalBreakdown() {
  const regions: RegionData[] = [
    {
      name: 'England',
      totalSeats: 543,
      declared: 320,
      seats: [
        { party: 'Labour', count: 210, change: +45 },
        { party: 'Conservative', count: 150, change: -60 },
        { party: 'Lib Dem', count: 35, change: +12 },
        { party: 'Green', count: 18, change: +6 },
        { party: 'Others', count: 30, change: -3 },
      ],
      swing: 3.8,
      turnout: 69.2,
      keyMarginals: 28,
    },
    {
      name: 'Scotland',
      totalSeats: 59,
      declared: 45,
      seats: [
        { party: 'SNP', count: 38, change: -5 },
        { party: 'Labour', count: 12, change: +8 },
        { party: 'Conservative', count: 7, change: -3 },
        { party: 'Lib Dem', count: 2, change: +1 },
      ],
      swing: -0.5,
      turnout: 67.8,
      keyMarginals: 8,
    },
    {
      name: 'Wales',
      totalSeats: 40,
      declared: 32,
      seats: [
        { party: 'Labour', count: 25, change: +3 },
        { party: 'Conservative', count: 8, change: -4 },
        { party: 'Plaid Cymru', count: 4, change: 0 },
        { party: 'Lib Dem', count: 2, change: +1 },
        { party: 'Others', count: 1, change: 0 },
      ],
      swing: 2.1,
      turnout: 68.5,
      keyMarginals: 5,
    },
    {
      name: 'Northern Ireland',
      totalSeats: 18,
      declared: 15,
      seats: [
        { party: 'Sinn Féin', count: 7, change: +1 },
        { party: 'DUP', count: 6, change: -1 },
        { party: 'Alliance', count: 3, change: +1 },
        { party: 'SDLP', count: 2, change: 0 },
        { party: 'Others', count: 2, change: -1 },
      ],
      swing: 0.3,
      turnout: 65.1,
      keyMarginals: 3,
    },
  ]

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Labour': return 'bg-party-labour'
      case 'Conservative': return 'bg-party-conservative'
      case 'Lib Dem': return 'bg-party-libdem'
      case 'SNP': return 'bg-party-snp'
      case 'Green': return 'bg-party-green'
      case 'Plaid Cymru': return 'bg-party-plaid'
      case 'Sinn Féin': return 'bg-green-700'
      case 'DUP': return 'bg-red-700'
      case 'Alliance': return 'bg-yellow-600'
      case 'SDLP': return 'bg-green-600'
      default: return 'bg-party-other'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Map className="w-5 h-5 mr-2 text-blue-400" />
          <h2 className="text-lg font-bold">Regional Breakdown</h2>
        </div>
        <div className="text-sm text-gray-400">Live Updates</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regions.map((region, regionIndex) => (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: regionIndex * 0.1 }}
            className="bg-background-tertiary rounded-lg border border-gray-800 overflow-hidden"
          >
            {/* 区域标题 */}
            <div className="px-4 py-3 border-b border-gray-800 bg-black/20">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{region.name}</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-400">
                    {region.declared}/{region.totalSeats} declared
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* 席位分布 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Seat Distribution
                </h4>
                <div className="space-y-2">
                  {region.seats.map((seat, index) => (
                    <div key={`${region.name}-${seat.party}`} className="flex items-center">
                      <div className="w-24 flex items-center">
                        <div className={`w-3 h-3 ${getPartyColor(seat.party)} rounded-full mr-2`}></div>
                        <span className="text-sm text-gray-300 truncate">{seat.party}</span>
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-400">{seat.count} seats</span>
                          <span className={seat.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {seat.change >= 0 ? '+' : ''}{seat.change}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPartyColor(seat.party)} rounded-full`}
                            style={{ width: `${(seat.count / region.totalSeats) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 关键指标 */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div className="text-center">
                  <div className="flex items-center justify-center text-sm text-gray-400 mb-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Swing
                  </div>
                  <div className={`text-lg font-bold ${region.swing >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {region.swing >= 0 ? '+' : ''}{region.swing}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-sm text-gray-400 mb-1">
                    <Users className="w-4 h-4 mr-1" />
                    Turnout
                  </div>
                  <div className="text-lg font-bold">{region.turnout}%</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Marginals</div>
                  <div className="text-lg font-bold text-yellow-400">{region.keyMarginals}</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Declaration Progress</span>
                  <span>{Math.round((region.declared / region.totalSeats) * 100)}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(region.declared / region.totalSeats) * 100}%` }}
                    transition={{ duration: 1.5, delay: regionIndex * 0.2 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 总结统计 */}
      <div className="bg-background-tertiary rounded-lg border border-gray-800 p-4">
        <h4 className="font-medium mb-3">Regional Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Highest Turnout</div>
            <div className="text-lg font-bold">England (69.2%)</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Largest Swing</div>
            <div className="text-lg font-bold text-green-400">England (+3.8%)</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Most Marginals</div>
            <div className="text-lg font-bold">England (28)</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Fastest Declarations</div>
            <div className="text-lg font-bold">Scotland (76%)</div>
          </div>
        </div>
      </div>
    </div>
  )
}