'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { translateParty } from '@/lib/i18n/translations'

export default function FilterPanel() {
  const { t, lang } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    parties: ['Conservative', 'Labour', 'SNP', 'Liberal Democrat', 'UKIP', 'Green Party', 'Others'],
    regions: ['All'],
    swingRange: [-20, 20],
    majorityRange: [0, 50000],
    turnoutRange: [50, 90],
    status: 'All',
  })

  const partyColors: Record<string, string> = {
    'Conservative': 'bg-party-conservative',
    'Labour': 'bg-party-labour',
    'Liberal Democrat': 'bg-party-libdem',
    'SNP': 'bg-party-snp',
    'UKIP': 'bg-purple-600',
    'Green Party': 'bg-party-green',
    'Others': 'bg-party-other',
  }

  const getPartyDisplay = (party: string) => {
    if (lang === 'zh') return translateParty(party, 'zh')
    const shortNames: Record<string, string> = {
      'Conservative': 'Con', 'Labour': 'Lab', 'Liberal Democrat': 'Lib Dem',
      'SNP': 'SNP', 'UKIP': 'UKIP', 'Green Party': 'Green', 'Others': 'Others',
    }
    return shortNames[party] || party
  }

  const toggleParty = (party: string) => {
    setFilters(prev => ({
      ...prev,
      parties: prev.parties.includes(party)
        ? prev.parties.filter(p => p !== party)
        : [...prev.parties, party]
    }))
  }

  const clearFilters = () => {
    setFilters({
      parties: ['Conservative', 'Labour', 'SNP', 'Liberal Democrat', 'UKIP', 'Green Party', 'Others'],
      regions: ['All'],
      swingRange: [-20, 20],
      majorityRange: [0, 50000],
      turnoutRange: [50, 90],
      status: 'All',
    })
  }

  const activeFilterCount =
    (filters.parties.length < 7 ? 1 : 0) +
    (filters.regions[0] !== 'All' ? 1 : 0) +
    (filters.swingRange[0] !== -20 || filters.swingRange[1] !== 20 ? 1 : 0) +
    (filters.majorityRange[0] !== 0 || filters.majorityRange[1] !== 50000 ? 1 : 0)

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-semibold text-sm text-slate-800">{t('filter.title')}</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {activeFilterCount} {t('filter.active')}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {filters.parties.length < 7 && (
              <div className="flex items-center space-x-1">
                {filters.parties.map(party => (
                  <div
                    key={party}
                    className="flex items-center px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600 font-medium"
                  >
                    <div className={`w-2 h-2 ${partyColors[party as keyof typeof partyColors]} rounded-full mr-1.5`}></div>
                    {getPartyDisplay(party)}
                  </div>
                ))}
              </div>
            )}

            {(filters.swingRange[0] !== -20 || filters.swingRange[1] !== 20) && (
              <div className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                {t('filter.swingRange')}: {filters.swingRange[0]}% {t('filter.to')} {filters.swingRange[1]}%
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {t('filter.clearAll')}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-3">{t('filter.party')}</h4>
                <div className="space-y-2">
                  {Object.entries(partyColors).map(([party, colorClass]) => (
                    <label key={party} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.parties.includes(party)}
                        onChange={() => toggleParty(party)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center transition-colors ${
                        filters.parties.includes(party)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {filters.parties.includes(party) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center flex-1">
                        <div className={`w-3 h-3 ${colorClass} rounded-full mr-2`}></div>
                        <span className="text-sm text-slate-700">{getPartyDisplay(party)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-3">{t('filter.swingRange')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('filter.min')}: {filters.swingRange[0]}%</span>
                    <span className="text-slate-500">{t('filter.max')}: {filters.swingRange[1]}%</span>
                  </div>
                  <div className="flex space-x-2">
                    <input type="range" min="-20" max="20" value={filters.swingRange[0]}
                      onChange={(e) => setFilters(prev => ({ ...prev, swingRange: [parseInt(e.target.value), prev.swingRange[1]] }))}
                      className="flex-1 accent-blue-600" />
                    <input type="range" min="-20" max="20" value={filters.swingRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, swingRange: [prev.swingRange[0], parseInt(e.target.value)] }))}
                      className="flex-1 accent-blue-600" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>-20% ({t('filter.conGain')})</span>
                    <span>0%</span>
                    <span>+20% ({t('filter.labGain')})</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-3">{t('filter.majorityRange')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('filter.min')}: {filters.majorityRange[0].toLocaleString()}</span>
                    <span className="text-slate-500">{t('filter.max')}: {filters.majorityRange[1].toLocaleString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <input type="range" min="0" max="50000" step="1000" value={filters.majorityRange[0]}
                      onChange={(e) => setFilters(prev => ({ ...prev, majorityRange: [parseInt(e.target.value), prev.majorityRange[1]] }))}
                      className="flex-1 accent-blue-600" />
                    <input type="range" min="0" max="50000" step="1000" value={filters.majorityRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, majorityRange: [prev.majorityRange[0], parseInt(e.target.value)] }))}
                      className="flex-1 accent-blue-600" />
                  </div>
                  <div className="text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>{t('sidebar.marginal')}</span>
                      <span>{t('sidebar.safe')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-3">{t('filter.status')} & {t('filter.region')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">{t('filter.status')}</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All">{t('filter.allStatus')}</option>
                      <option value="Declared">{t('filter.declared')}</option>
                      <option value="Undeclared">{t('filter.undeclared')}</option>
                      <option value="Too Close">{t('filter.tooClose')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">{t('filter.region')}</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'England', label: t('filter.england') },
                        { key: 'Scotland', label: t('filter.scotland') },
                        { key: 'Wales', label: t('filter.wales') },
                        { key: 'Northern Ireland', label: t('filter.ni') },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            regions: prev.regions[0] === key ? ['All'] : [key]
                          }))}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-medium ${
                            filters.regions[0] === key
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
              <button onClick={clearFilters}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors font-medium">
                {t('filter.resetAll')}
              </button>
              <button onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm">
                {t('filter.apply')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
