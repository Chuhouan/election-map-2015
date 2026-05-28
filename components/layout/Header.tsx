'use client'

import { motion } from 'framer-motion'
import { Search, Globe, X, MapPin } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import constituencyData, { PARTY_COLORS_2015 } from '@/lib/data/constituencies-2015-real'

interface SearchResult {
  name: string
  county: string
  nation: string
  winner: string
  color: string
}

export interface HeaderProps {
  onSelectConstituency?: (constituency: any) => void
}

export default function Header({ onSelectConstituency }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t, lang, toggleLang } = useLanguage()

  // 搜索逻辑（基于真实2015数据）
  const performSearch = useCallback((query: string) => {
    if (query.trim().length < 1) {
      setSearchResults([])
      setShowResults(false)
      return
    }
    const lowerQuery = query.toLowerCase()
    const results = constituencyData
      .filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.county?.toLowerCase().includes(lowerQuery) ||
        c.region.toLowerCase().includes(lowerQuery) ||
        c.nation.toLowerCase().includes(lowerQuery) ||
        c.candidates.some(cand => cand.name.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 8)
      .map(c => ({
        name: c.name,
        county: c.county || c.region,
        nation: c.nation,
        winner: c.winner,
        color: PARTY_COLORS_2015[c.winner] || '#888888',
      }))
    setSearchResults(results)
    setShowResults(results.length > 0)
  }, [])

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery, performSearch])

  // 点击外部关闭搜索
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 选中选区后，调用回调并设置地图视图
  const handleSelectResult = (result: SearchResult) => {
    const found = constituencyData.find(c => c.name === result.name)
    if (found && onSelectConstituency) {
      onSelectConstituency(found)
    }
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* 左侧：标题和选举信息 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider">UK</div>
                  <div className="h-5 w-px bg-slate-300"></div>
                  <h1 className="text-base font-bold text-slate-800 tracking-tight">
                    {t('header.title')}
                  </h1>
                </div>

            {/* 选举状态标签 */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                {t('header.live')}
              </span>
              <span className="text-xs text-slate-500">{t('header.coverage')}</span>
            </div>
          </div>
        </div>

        {/* 右侧：搜索和控件 */}
        <div className="flex items-center space-x-4">
          {/* 2015 席位统计 */}
          <div className="flex items-center space-x-5">
            <div className="text-center">
              <div className="text-xs text-slate-500">{t('header.seatsDeclared')}</div>
              <div className="text-lg font-bold text-slate-800">650</div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-center">
              <div className="text-xs text-slate-500">{t('header.majority')}</div>
              <div className="text-lg font-bold text-[#0087DC]">+10</div>
            </div>
          </div>

          {/* 实时搜索 */}
          <div ref={searchRef} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('header.search')}
              className="pl-10 pr-8 py-2 w-72 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowResults(false) }}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* 搜索结果下拉 */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 animate-fadeInDown">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectResult(result)}
                    className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: result.color }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{result.name}</div>
                      <div className="text-xs text-slate-500 flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{result.county}</span>
                        <span>·</span>
                        <span>{result.winner}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 无结果提示 */}
            {showResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 z-50 animate-fadeInDown">
                <p className="text-sm text-slate-500">{t('header.searchNoResults')}</p>
              </div>
            )}
          </div>

          {/* 语言切换 */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm transition-colors hover:bg-slate-50 text-slate-600"
            title={t('header.switchLang')}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">
              {lang === 'zh' ? 'EN' : '中文'}
            </span>
          </button>
        </div>
      </div>

      {/* 政党颜色指标条 */}
      <div className="h-1 flex">
        <motion.div 
          className="h-full bg-party-conservative"
          initial={{ width: '0%' }}
          animate={{ width: '50.8%' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <motion.div 
          className="h-full bg-party-labour"
          initial={{ width: '0%' }}
          animate={{ width: '35.7%' }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
        <motion.div 
          className="h-full bg-party-snp"
          initial={{ width: '0%' }}
          animate={{ width: '8.6%' }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
        />
        <motion.div 
          className="h-full bg-party-libdem"
          initial={{ width: '0%' }}
          animate={{ width: '1.2%' }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
        />
        <motion.div 
          className="h-full bg-party-other"
          initial={{ width: '0%' }}
          animate={{ width: '3.7%' }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
        />
      </div>
    </header>
  )
}
