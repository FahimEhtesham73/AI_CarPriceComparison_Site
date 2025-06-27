import { useState } from 'react'
import { ExternalLink, TrendingUp, Award, Filter, BarChart3 } from 'lucide-react'
import PriceChart from './PriceChart'
import CarCard from './CarCard'

const ResultsDisplay = ({ results }) => {
  const [sortBy, setSortBy] = useState('price')
  const [filterBy, setFilterBy] = useState('all')

  if (!results || results.length === 0) {
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

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price.replace(/[^0-9]/g, '')) - parseFloat(b.price.replace(/[^0-9]/g, ''))
      case 'site':
        return a.site.localeCompare(b.site)
      case 'year':
        return (b.specs?.year || 0) - (a.specs?.year || 0)
      default:
        return 0
    }
  })

  // Filter results
  const filteredResults = sortedResults.filter(result => {
    if (filterBy === 'all') return true
    return result.site.toLowerCase() === filterBy.toLowerCase()
  })

  // Get unique sites for filter
  const uniqueSites = [...new Set(results.map(r => r.site))]

  // Calculate statistics
  const prices = results.map(r => parseFloat(r.price.replace(/[^0-9]/g, '')))
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <div className="mt-12 space-y-8 animate-slide-up">
      {/* Statistics Overview */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Price Analysis</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Results</p>
            <p className="text-2xl font-bold text-blue-700">{results.length}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Lowest Price</p>
            <p className="text-2xl font-bold text-green-700">৳{minPrice.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Average Price</p>
            <p className="text-2xl font-bold text-orange-700">৳{Math.round(avgPrice).toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Highest Price</p>
            <p className="text-2xl font-bold text-red-700">৳{maxPrice.toLocaleString()}</p>
          </div>
        </div>

        <PriceChart data={results} />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="price">Price (Low to High)</option>
                <option value="site">Website</option>
                <option value="year">Year (Newest First)</option>
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
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredResults.length} of {results.length} results
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((car, index) => (
          <CarCard key={index} car={car} index={index} />
        ))}
      </div>
    </div>
  )
}

export default ResultsDisplay