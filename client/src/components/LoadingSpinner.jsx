import { Loader2, Bot, Search, Database, Brain, Zap, Activity } from 'lucide-react'

const LoadingSpinner = () => {
  const agents = [
    { name: 'Bikroy Agent', icon: Search, status: 'Scraping 50+ listings from Bikroy.com...', color: 'text-green-600', progress: 85 },
    { name: 'AI Analyzer', icon: Brain, status: 'Processing scraped data with intelligent filtering...', color: 'text-purple-600', progress: 70 },
    { name: 'Carmudi Agent', icon: Database, status: 'Fetching Carmudi data with smart filtering...', color: 'text-blue-600', progress: 45 },
    { name: 'OLX Agent', icon: Bot, status: 'Processing OLX listings with semantic matching...', color: 'text-orange-600', progress: 30 }
  ]

  return (
    <div className="mt-12 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <div className="relative">
              <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
              <Zap className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            AI Agents Working Hard
          </h3>
          <p className="text-gray-600 mb-4">
            Our intelligent multi-agent system is scraping and analyzing live data from multiple platforms
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Live scraping in progress...</span>
          </div>
        </div>

        <div className="space-y-4">
          {agents.map((agent, index) => (
            <div key={agent.name} className="relative">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <agent.icon className={`h-6 w-6 ${agent.color} animate-pulse`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-600">{agent.status}</p>
                  
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        agent.color.replace('text-', 'bg-')
                      }`}
                      style={{ width: `${agent.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${agent.color.replace('text-', 'bg-')} rounded-full animate-pulse`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI processing live scraped data...</span>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-700 mb-2">
              <Brain className="h-4 w-4" />
              <span className="font-medium">Real-time Progress</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-blue-600">
              <div>✓ 50+ listings scraped from Bikroy</div>
              <div>⏳ AI filtering and analysis</div>
              <div>⏳ Price anomaly detection</div>
              <div>⏳ Generating recommendations</div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            This may take 30-60 seconds depending on website response times and AI analysis complexity
          </p>
        </div>

        {/* Enhanced progress indicators */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Data Collection</span>
            <span>AI Analysis</span>
            <span>Results</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 h-3 rounded-full animate-pulse transition-all duration-2000" style={{ width: '75%' }}></div>
          </div>
          <div className="text-center text-xs text-gray-600">
            Processing scraped data with AI enhancement...
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner