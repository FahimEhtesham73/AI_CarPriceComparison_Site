import { Car, Zap, Brain, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAIHealth } from '../services/api'

const Header = () => {
  const [aiStatus, setAiStatus] = useState({ enabled: false })

  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    try {
      const status = await getAIHealth()
      setAiStatus(status.ai || { enabled: false })
    } catch (error) {
      console.error('Failed to check AI status:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CarCompare AI</h1>
              <p className="text-xs text-gray-500">Multi-Agent Price Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* AI Status Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                aiStatus.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <Brain className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {aiStatus.enabled ? 'AI Active' : 'AI Limited'}
                </span>
              </div>
            </div>

            {/* Features Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>AI-Powered</span>
            </div>

            {/* Live Status */}
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <Activity className="h-3 w-3 animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header