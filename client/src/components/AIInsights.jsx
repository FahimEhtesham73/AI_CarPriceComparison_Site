import { Brain, TrendingUp, AlertTriangle, CheckCircle, Target, BarChart3 } from 'lucide-react'

const AIInsights = ({ analysis, recommendations, metadata }) => {
  if (!analysis && !recommendations) return null

  const { pricePrediction, searchEnhancement } = analysis || {}
  const processingTime = metadata?.processingTime || 0

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl p-6 mb-8 animate-slide-up">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-600 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Market Intelligence</h2>
          <p className="text-sm text-gray-600">
            Processed in {(processingTime / 1000).toFixed(1)}s with advanced AI analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Analysis */}
        {pricePrediction && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Price Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Predicted Range</span>
                <span className="font-semibold text-gray-900">
                  ৳{(pricePrediction.minPrice / 100000).toFixed(1)}L - ৳{(pricePrediction.maxPrice / 100000).toFixed(1)}L
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Market Average</span>
                <span className="font-semibold text-blue-600">
                  ৳{(pricePrediction.averagePrice / 100000).toFixed(1)}L
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Confidence</span>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pricePrediction.confidence === 'high' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pricePrediction.confidence?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Enhancement */}
        {searchEnhancement && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Search Enhancement</h3>
            </div>
            
            <div className="space-y-3">
              {searchEnhancement.standardized?.brand && (
                <div>
                  <span className="text-sm text-gray-600">AI Detected Brand: </span>
                  <span className="font-medium text-gray-900">{searchEnhancement.standardized.brand}</span>
                </div>
              )}
              
              {searchEnhancement.standardized?.model && (
                <div>
                  <span className="text-sm text-gray-600">AI Detected Model: </span>
                  <span className="font-medium text-gray-900">{searchEnhancement.standardized.model}</span>
                </div>
              )}
              
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                AI enhanced your search query for better matching across platforms
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{rec.reason}</p>
                    
                    {rec.pros && rec.pros.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-green-600 font-medium">Pros: </span>
                        <span className="text-sm text-gray-600">{rec.pros.join(', ')}</span>
                      </div>
                    )}
                    
                    {rec.cons && rec.cons.length > 0 && (
                      <div>
                        <span className="text-xs text-red-600 font-medium">Cons: </span>
                        <span className="text-sm text-gray-600">{rec.cons.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  {rec.score && (
                    <div className="ml-4 text-center">
                      <div className="text-lg font-bold text-blue-600">{rec.score}</div>
                      <div className="text-xs text-gray-500">AI Score</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Stats */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500 bg-white rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Brain className="h-4 w-4" />
            <span>AI Enhanced</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Market Analysis</span>
          </div>
        </div>
        <div className="text-xs">
          Last updated: {new Date(metadata?.timestamp || Date.now()).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default AIInsights