import { useState, useEffect } from 'react'
import { TrendingUp, PieChart, BarChart3, Target, RefreshCw } from 'lucide-react'
import { getMarketInsights } from '../services/api'

const MarketInsights = ({ filters, results }) => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (filters?.model) {
      fetchInsights()
    }
  }, [filters])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const data = await getMarketInsights(filters)
      setInsights(data)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!insights && !loading) return null

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Market Insights</h2>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Market Size */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-600 font-medium">Available Listings</p>
          <p className="text-2xl font-bold text-blue-700">{insights?.marketSize || 0}</p>
        </div>

        {/* Price Range */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-600 font-medium">Price Range</p>
          <p className="text-lg font-bold text-green-700">
            ৳{((insights?.priceRange?.min || 0) / 100000).toFixed(1)}L - ৳{((insights?.priceRange?.max || 0) / 100000).toFixed(1)}L
          </p>
        </div>

        {/* Average Price */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <PieChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-purple-600 font-medium">Market Average</p>
          <p className="text-2xl font-bold text-purple-700">
            ৳{((insights?.priceRange?.average || 0) / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      {/* Platform Distribution */}
      {insights?.platformDistribution && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Distribution</h3>
          <div className="space-y-2">
            {Object.entries(insights.platformDistribution).map(([platform, count]) => {
              const percentage = (count / insights.marketSize) * 100
              return (
                <div key={platform} className="flex items-center space-x-3">
                  <div className="w-20 text-sm text-gray-600">{platform}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Recommendations</h3>
          <div className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketInsights