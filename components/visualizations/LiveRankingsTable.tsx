'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, Award, Users, Clock } from 'lucide-react'

type RankingType = 'swing' | 'majority' | 'turnout' | 'upsets'

interface RankingItem {
  id: number
  constituency: string
  region: string
  value: number
  change?: number
  party: string
  status: 'declared' | 'undeclared' | 'close'
}

export default function LiveRankingsTable() {
  const [activeTab, setActiveTab] = useState<RankingType>('swing')

  const rankings: Record<RankingType, RankingItem[]> = {
    swing: [
      { id: 1, constituency: 'Richmond Park', region: 'London', value: 12.8, change: +12.8, party: 'Lib Dem', status: 'declared' },
      { id: 2, constituency: 'Cities of London & Westminster', region: 'London', value: 11.2, change: +11.2, party: 'Labour', status: 'declared' },
      { id: 3, constituency: 'Chelsea & Fulham', region: 'London', value: 10.5, change: +10.5, party: 'Labour', status: 'declared' },
      { id: 4, constituency: 'Wimbledon', region: 'London', value: 9.8, change: +9.8, party: 'Labour', status: 'declared' },
      { id: 5, constituency: 'St Ives', region: 'South West', value: 9.3, change: +9.3, party: 'Lib Dem', status: 'declared' },
      { id: 6, constituency: 'Eastbourne', region: 'South East', value: 8.7, change: +8.7, party: 'Lib Dem', status: 'declared' },
      { id: 7, constituency: 'Devizes', region: 'South West', value: -8.2, change: -8.2, party: 'Labour', status: 'declared' },
      { id: 8, constituency: 'North East Somerset', region: 'South West', value: -7.9, change: -7.9, party: 'Labour', status: 'declared' },
    ],
    majority: [
      { id: 1, constituency: 'Liverpool Walton', region: 'North West', value: 38572, party: 'Labour', status: 'declared' },
      { id: 2, constituency: 'Knowsley', region: 'North West', value: 36789, party: 'Labour', status: 'declared' },
      { id: 3, constituency: 'Bootle', region: 'North West', value: 34567, party: 'Labour', status: 'declared' },
      { id: 4, constituency: 'Weston-super-Mare', region: 'South West', value: 32456, party: 'Conservative', status: 'declared' },
      { id: 5, constituency: 'Cities of London & Westminster', region: 'London', value: 29876, party: 'Labour', status: 'declared' },
      { id: 6, constituency: 'East Ham', region: 'London', value: 28765, party: 'Labour', status: 'declared' },
      { id: 7, constituency: 'Brent North', region: 'London', value: 27654, party: 'Labour', status: 'declared' },
      { id: 8, constituency: 'Hornchurch & Upminster', region: 'London', value: 26543, party: 'Conservative', status: 'declared' },
    ],
    turnout: [
      { id: 1, constituency: 'St Albans', region: 'East of England', value: 81.2, party: 'Lib Dem', status: 'declared' },
      { id: 2, constituency: 'Cambridge', region: 'East of England', value: 79.8, party: 'Labour', status: 'declared' },
      { id: 3, constituency: 'Oxford East', region: 'South East', value: 78.6, party: 'Labour', status: 'declared' },
      { id: 4, constituency: 'Bath', region: 'South West', value: 77.9, party: 'Lib Dem', status: 'declared' },
      { id: 5, constituency: 'Brighton Pavilion', region: 'South East', value: 76.5, party: 'Green', status: 'declared' },
      { id: 6, constituency: 'Chelsea & Fulham', region: 'London', value: 75.8, party: 'Labour', status: 'declared' },
      { id: 7, constituency: 'Richmond Park', region: 'London', value: 75.2, party: 'Lib Dem', status: 'declared' },
      { id: 8, constituency: 'Edinburgh Central', region: 'Scotland', value: 74.9, party: 'SNP', status: 'declared' },
    ],
    upsets: [
      { id: 1, constituency: 'Surrey Heath', region: 'South East', value: 15678, change: -12567, party: 'Labour', status: 'declared' },
      { id: 2, constituency: 'Mid Bedfordshire', region: 'East of England', value: 1234, change: -18976, party: 'Labour', status: 'declared' },
      { id: 3, constituency: 'South Cambridgeshire', region: 'East of England', value: 2345, change: -14567, party: 'Lib Dem', status: 'declared' },
      { id: 4, constituency: 'Harrow East', region: 'London', value: 3456, change: -9876, party: 'Labour', status: 'declared' },
      { id: 5, constituency: 'Dorset North', region: 'South West', value: 4567, change: -8765, party: 'Lib Dem', status: 'declared' },
      { id: 6, constituency: 'Bexhill & Battle', region: 'South East', value: 5678, change: -7654, party: 'Labour', status: 'declared' },
      { id: 7, constituency: 'Sutton Coldfield', region: 'West Midlands', value: 6789, change: -6543, party: 'Labour', status: 'declared' },
      { id: 8, constituency: 'Wokingham', region: 'South East', value: 7890, change: -5432, party: 'Lib Dem', status: 'declared' },
    ],
  }

  const tabConfig: Record<RankingType, { label: string; icon: React.ReactNode; unit: string }> = {
    swing: { label: 'Largest Swings', icon: <TrendingUp className="w-4 h-4" />, unit: '%' },
    majority: { label: 'Safest Seats', icon: <Target className="w-4 h-4" />, unit: '' },
    turnout: { label: 'Highest Turnout', icon: <Users className="w-4 h-4" />, unit: '%' },
    upsets: { label: 'Biggest Upsets', icon: <Award className="w-4 h-4" />, unit: '' },
  }

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Labour': return 'bg-party-labour'
      case 'Conservative': return 'bg-party-conservative'
      case 'Lib Dem': return 'bg-party-libdem'
      case 'SNP': return 'bg-party-snp'
      case 'Green': return 'bg-party-green'
      default: return 'bg-gray-600'
    }
  }

  const formatValue = (value: number, type: RankingType) => {
    if (type === 'majority' || type === 'upsets') {
      return value.toLocaleString()
    }
    return type === 'turnout' ? `${value}%` : `${value > 0 ? '+' : ''}${value}%`
  }

  return (
    <div className="bg-background-tertiary rounded-lg border border-gray-800 overflow-hidden">
      {/* 标签页标题 */}
      <div className="border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            <h2 className="font-bold">Live Rankings</h2>
          </div>
          <div className="text-sm text-gray-400">Updated 2 min ago</div>
        </div>
        
        {/* 标签页切换 */}
        <div className="flex border-b border-gray-800">
          {(Object.keys(tabConfig) as RankingType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
              }`}
            >
              {tabConfig[tab].icon}
              <span>{tabConfig[tab].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Rank</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Constituency</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Region</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Party</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                {tabConfig[activeTab].label.split(' ').pop()}
              </th>
              {activeTab === 'swing' || activeTab === 'upsets' ? (
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Change</th>
              ) : null}
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {rankings[activeTab].map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < 3 ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{item.constituency}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-400">{item.region}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${getPartyColor(item.party)} rounded-full mr-2`}></div>
                    <span className="text-sm">{item.party}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className={`font-mono font-medium ${
                    activeTab === 'swing' 
                      ? item.value > 0 ? 'text-green-400' : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {formatValue(item.value, activeTab)}
                  </div>
                </td>
                {activeTab === 'swing' || activeTab === 'upsets' ? (
                  <td className="py-3 px-4">
                    {item.change !== undefined && (
                      <div className={`flex items-center text-sm ${
                        item.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {item.change > 0 ? '+' : ''}{item.change}{activeTab === 'swing' ? '%' : ''}
                      </div>
                    )}
                  </td>
                ) : null}
                <td className="py-3 px-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    item.status === 'declared' 
                      ? 'bg-green-900/30 text-green-400'
                      : item.status === 'close'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {item.status === 'declared' ? 'Declared' : 
                     item.status === 'close' ? 'Too Close' : 'Undeclared'}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部摘要 */}
      <div className="px-4 py-3 border-t border-gray-800 bg-black/20">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            Showing top 8 rankings • Total tracked: {rankings[activeTab].length * 5}
          </div>
          <button className="text-blue-400 hover:text-blue-300 transition-colors">
            View Full Rankings →
          </button>
        </div>
      </div>
    </div>
  )
}