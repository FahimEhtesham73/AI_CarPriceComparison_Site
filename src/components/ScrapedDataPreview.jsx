import { useState } from 'react'
import { Eye, ExternalLink, Calendar, MapPin, Gauge, Filter, SortAsc, SortDesc, Brain, AlertTriangle, CheckCircle, Zap, Award } from 'lucide-react'

const ScrapedDataPreview = ({ scrapedData, isLoading }) => {
  const [sortBy, setSortBy] = useState('price')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterYear, setFilterYear] = useState('')
  const [filterPriceRange, setFilterPriceRange] = useState('')
  const [showOnlyValid, setShowOnlyValid] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!scrapedData || scrapedData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Eye className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Live Data Available</h3>
        <p className="text-gray-600 mb-4">
          Start a search to see real-time scraped data from Bikroy and other platforms
        </p>
        <div className="inline-flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          <Zap className="h-4 w-4" />
          <span>Live scraping powered by AI agents</span>
        </div>
      </div>
    )
  }

  // Data processing functions
  const extractPrice = (priceStr) => {
    if (!priceStr) return 0
    const numericStr = priceStr.replace(/[^\d]/g, '')
    return parseInt(numericStr) || 0
  }

  const isValidListing = (item) => {
    const price = extractPrice(item.price)
    return item.title && 
           item.title.length > 10 && 
           item.price && 
           price > 100000 && 
           price < 50000000 && // Reasonable upper limit
           item.specs?.year && 
           item.specs.year > 1990 && 
           item.specs.year <= new Date().getFullYear()
  }

  // Filter data
  let filteredData = scrapedData.filter(item => {
    if (showOnlyValid && !isValidListing(item)) return false
    
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    if (filterYear && item.specs?.year && item.specs.year.toString() !== filterYear) {
      return false
    }
    
    if (filterPriceRange) {
      const price = extractPrice(item.price)
      const [min, max] = filterPriceRange.split('-').map(p => parseInt(p) * 100000)
      if (price < min || price > max) return false
    }
    
    return true
  })

  // Sort data
  filteredData.sort((a, b) => {
    let aVal, bVal
    
    switch (sortBy) {
      case 'price':
        aVal = extractPrice(a.price)
        bVal = extractPrice(b.price)
        break
      case 'year':
        aVal = a.specs?.year || 0
        bVal = b.specs?.year || 0
        break
      case 'title':
        aVal = a.title.toLowerCase()
        bVal = b.title.toLowerCase()
        break
      case 'confidence':
        aVal = a.aiInsights?.priceScore || 0
        bVal = b.aiInsights?.priceScore || 0
        break
      default:
        return 0
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  // Get unique years for filter
  const uniqueYears = [...new Set(scrapedData
    .map(item => item.specs?.year)
    .filter(year => year && year > 1990)
    .sort((a, b) => b - a)
  )]

  // Calculate stats
  const validListings = scrapedData.filter(isValidListing)
  const prices = validListings.map(item => extractPrice(item.price))
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const recommendedCount = scrapedData.filter(item => item.aiInsights?.recommended).length
  const suspiciousCount = scrapedData.filter(item => item.aiInsights?.suspicious).length

  // Get extraction methods
  const extractionMethods = {}
  scrapedData.forEach(item => {
    const method = item.aiInsights?.extractionMethod || 'Unknown'
    extractionMethods[method] = (extractionMethods[method] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Live Scraped Data Analysis</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Zap className="h-4 w-4" />
            <span>Real-time Data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-blue-600 font-medium">Total Scraped</p>
            <p className="text-2xl font-bold text-blue-700">{scrapedData.length}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-green-600 font-medium">Valid Listings</p>
            <p className="text-2xl font-bold text-green-700">{validListings.length}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-orange-600 font-medium">Avg Price</p>
            <p className="text-lg font-bold text-orange-700">
              ৳{(avgPrice / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-purple-600 font-medium">Price Range</p>
            <p className="text-sm font-bold text-purple-700">
              ৳{(minPrice / 100000).toFixed(1)}L - ৳{(maxPrice / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-yellow-600 font-medium">AI Picks</p>
            <p className="text-2xl font-bold text-yellow-700">{recommendedCount}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-red-600 font-medium">Alerts</p>
            <p className="text-2xl font-bold text-red-700">{suspiciousCount}</p>
          </div>
        </div>

        {/* Extraction Methods */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Extraction Methods Used</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(extractionMethods).map(([method, count]) => (
              <span key={method} className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {method}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Controls</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search titles..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Price</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
              <option value="confidence">AI Score</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center space-x-1"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              <span>{sortOrder === 'asc' ? 'Low to High' : 'High to Low'}</span>
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterPriceRange}
            onChange={(e) => setFilterPriceRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Prices</option>
            <option value="3-10">৳3L - ৳10L</option>
            <option value="10-15">৳10L - ৳15L</option>
            <option value="15-25">৳15L - ৳25L</option>
            <option value="25-35">৳25L - ৳35L</option>
            <option value="35-50">৳35L+</option>
          </select>
          
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyValid}
              onChange={(e) => setShowOnlyValid(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Valid only</span>
          </label>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
          <span>Showing {filteredData.length} of {scrapedData.length} scraped listings</span>
          <span className="text-xs text-blue-600">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Enhanced Scraped Data List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Scraped Listings</h3>
              <p className="text-sm text-gray-600">Live data from Bikroy.com with AI analysis</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredData.map((item, index) => {
            const price = extractPrice(item.price)
            const isValid = isValidListing(item)
            const extractionMethod = item.aiInsights?.extractionMethod || 'Unknown'
            const confidence = item.aiInsights?.confidence || 'medium'
            const priceScore = item.aiInsights?.priceScore || 0
            
            return (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.title}
                          </h4>
                          {item.aiInsights?.recommended && (
                            <Award className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{item.specs?.year || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.specs?.location || 'N/A'}</span>
                          </div>
                          {item.specs?.mileage && (
                            <div className="flex items-center space-x-1">
                              <Gauge className="h-4 w-4" />
                              <span>{item.specs.mileage.toLocaleString()} km</span>
                            </div>
                          )}
                          {item.specs?.color && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {item.specs.color}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {item.site}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            Page {item.aiInsights?.pageNumber || 1}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            confidence === 'high' ? 'bg-green-100 text-green-800' :
                            confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {confidence} confidence
                          </span>
                          {isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          ৳{price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.price}
                        </div>
                        
                        {priceScore > 0 && (
                          <div className="text-xs text-purple-600 mt-1">
                            AI Score: {priceScore}
                          </div>
                        )}
                        
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced AI Insights */}
                {item.aiInsights && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-blue-700">
                        <Brain className="h-3 w-3" />
                        <span>Extraction: {extractionMethod}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.aiInsights.recommended && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            AI Recommended
                          </span>
                        )}
                        {item.aiInsights.suspicious && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Price Alert
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Filter className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No listings match your current filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrapedDataPreview