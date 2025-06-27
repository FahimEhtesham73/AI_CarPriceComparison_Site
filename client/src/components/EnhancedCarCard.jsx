import { ExternalLink, Calendar, Palette, MapPin, Award, Brain, AlertTriangle, CheckCircle, Gauge, Fuel, Settings } from 'lucide-react'

const EnhancedCarCard = ({ car, index }) => {
  const price = parseFloat(car.price.replace(/[^0-9]/g, ''))
  
  const getSiteColor = (site) => {
    const colors = {
      'Bikroy': 'bg-green-100 text-green-800 border-green-200',
      'Carmudi': 'bg-blue-100 text-blue-800 border-blue-200',
      'OLX': 'bg-purple-100 text-purple-800 border-purple-200',
      'CarDekho': 'bg-orange-100 text-orange-800 border-orange-200',
    }
    return colors[site] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getAIScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group animate-slide-up border border-gray-100"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {car.image ? (
          <img
            src={car.image}
            alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No Image</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSiteColor(car.site)}`}>
            {car.site}
          </span>
          
          {car.aiInsights?.recommended && (
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>AI Pick</span>
            </div>
          )}
        </div>

        {/* AI Insights Badge */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {car.aiInsights?.priceScore && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAIScoreColor(car.aiInsights.priceScore)}`}>
              <div className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>{car.aiInsights.priceScore}</span>
              </div>
            </div>
          )}
          
          {car.aiInsights?.suspicious && (
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Check Price</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {car.title}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-blue-600">
            ৳{price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">BDT</p>
        </div>

        {/* Enhanced Specs */}
        {car.specs && (
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              {car.specs.year && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{car.specs.year}</span>
                </div>
              )}
              {car.specs.color && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Palette className="h-4 w-4" />
                  <span>{car.specs.color}</span>
                </div>
              )}
              {car.specs.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{car.specs.location}</span>
                </div>
              )}
              {car.specs.mileage && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Gauge className="h-4 w-4" />
                  <span>{car.specs.mileage.toLocaleString()} km</span>
                </div>
              )}
              {car.specs.transmission && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span>{car.specs.transmission}</span>
                </div>
              )}
              {car.specs.fuelType && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Fuel className="h-4 w-4" />
                  <span>{car.specs.fuelType}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {car.aiInsights?.marketAnalysis && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{car.aiInsights.marketAnalysis}</p>
            </div>
          </div>
        )}

        {/* Match Quality */}
        {(car.matchScore !== undefined || car.semanticScore !== undefined) && (
          <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
            {car.matchScore !== undefined && (
              <div>Match: {Math.round((1 - car.matchScore) * 100)}%</div>
            )}
            {car.semanticScore !== undefined && (
              <div>Relevance: {Math.round(car.semanticScore * 100)}%</div>
            )}
          </div>
        )}

        {/* View Details Button */}
        <a
          href={car.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 group"
        >
          <span>View Details</span>
          <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>
    </div>
  )
}

export default EnhancedCarCard