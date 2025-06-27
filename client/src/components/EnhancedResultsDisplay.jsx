import { useState } from 'react'
import { Filter, BarChart3, Brain, TrendingUp, AlertTriangle, Eye } from 'lucide-react'
import PriceChart from './PriceChart'
import EnhancedCarCard from './EnhancedCarCard'
import AIInsights from './AIInsights'
import MarketInsights from './MarketInsights'
import ScrapedDataPreview from './ScrapedDataPreview'

const EnhancedResultsDisplay = ({ searchData, filters }) => {
  const [activeTab, setActiveTab] = useState('results')
  const [sortBy, setSortBy] = useState('ai_score')
  const [filterBy, setFilterBy] = useState('all')
  const [showSuspicious, setShowSuspicious] = useState(true)

  if (!searchData?.results || searchData.results.length === 0) {
    return (
      <div className="mt-12 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            Try adjusting your search filters or search for a different car model.
          </p>
        </div>
      </div>
    )
  }

  const { results, analysis, recommendations, metadata, rawScrapedData } = searchData

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'ai_score':
        const scoreA = (a.aiInsights?.priceScore || 0) + 
                      (a.aiInsights?.recommended ? 20 : 0) + 
                      ((1 - (a.matchScore || 0.5)) * 10)
        const scoreB = (b.aiInsights?.priceScore || 0) + 
                      (b.aiInsights?.recommended ? 20 : 0) + 
                      ((1 - (b.matchScore || 0.5)) * 10)
        return scoreB - scoreA
      case 'price':
        return parseFloat(a.price.replace(/[^0-9]/g, '')) - parseFloat(b.price.replace(/[^0-9]/g, ''))
      case 'year':
        return (b.specs?.year || 0) - (a.specs?.year || 0)
      case 'site':
        return a.site.localeCompare(b.site)
      default:
        return 0
    }
  })

  // Filter results
  const filteredResults = sortedResults.filter(result => {
    if (filterBy !== 'all' && result.site.toLowerCase() !== filterBy.toLowerCase()) {
      return false
    }
    if (!showSuspicious && result.aiInsights?.suspicious) {
      return false
    }
    return true
  })

  // Get unique sites for filter
  const uniqueSites = [...new Set(results.map(r => r.site))]

  // Calculate statistics
  const prices = results.map(r => parseFloat(r.price.replace(/[^0-9]/g, '')))
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  // Count AI insights
  const recommendedCount = results.filter(r => r.aiInsights?.recommended).length
  const suspiciousCount = results.filter(r => r.aiInsights?.suspicious).length

  return (
    <div className="mt-12 space-y-8 animate-slide-up">
      {/* AI Insights */}
      <AIInsights 
        analysis={analysis} 
        recommendations={recommendations} 
        metadata={metadata} 
      />

      {/* Market Insights */}
      <MarketInsights filters={filters} results={results} />

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Processed Results ({filteredResults.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'raw'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Raw Scraped Data ({rawScrapedData?.length || 0})</span>
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'results' && (
          <div className="p-6">
            {/* Enhanced Statistics Overview */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">AI-Enhanced Analysis</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Results</p>
                  <p className="text-2xl font-bold text-blue-700">{results.length}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Lowest Price</p>
                  <p className="text-xl font-bold text-green-700">৳{(minPrice / 100000).toFixed(1)}L</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Average Price</p>
                  <p className="text-xl font-bold text-orange-700">৳{(avgPrice / 100000).toFixed(1)}L</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Highest Price</p>
                  <p className="text-xl font-bold text-red-700">৳{(maxPrice / 100000).toFixed(1)}L</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">AI Picks</p>
                  <p className="text-2xl font-bold text-purple-700">{recommendedCount}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Price Alerts</p>
                  <p className="text-2xl font-bold text-yellow-700">{suspiciousCount}</p>
                </div>
              </div>

              <PriceChart data={results} />
            </div>

            {/* Enhanced Controls */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ai_score">AI Score (Best Match)</option>
                      <option value="price">Price (Low to High)</option>
                      <option value="year">Year (Newest First)</option>
                      <option value="site">Website</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Site</label>
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Sites</option>
                      {uniqueSites.map(site => (
                        <option key={site} value={site}>{site}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="showSuspicious"
                      checked={showSuspicious}
                      onChange={(e) => setShowSuspicious(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="showSuspicious" className="text-sm text-gray-700 flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Show price alerts</span>
                    </label>
                  </div>
                </div>

                <div className="text-sm text-gray-600 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span>AI Enhanced</span>
                  </div>
                  <div>
                    Showing {filteredResults.length} of {results.length} results
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((car, index) => (
                <EnhancedCarCard key={`${car.site}-${index}`} car={car} index={index} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="p-6">
            <ScrapedDataPreview 
              scrapedData={rawScrapedData} 
              isLoading={false}
            />
          </div>
        )}
      </div>

      {/* Processing Information */}
      {metadata && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            AI processing completed in {(metadata.processingTime / 1000).toFixed(1)} seconds • 
            Enhanced with intelligent matching and price analysis • 
            Last updated: {new Date(metadata.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default EnhancedResultsDisplay