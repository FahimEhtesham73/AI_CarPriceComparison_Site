import { Github, Globe, Zap, Brain, Database, Shield } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CarCompare AI</h3>
            <p className="text-gray-400 mb-4">
              Advanced AI-powered multi-agent car price comparison platform for Bangladesh. 
              Get intelligent insights and the best deals across multiple marketplaces.
            </p>
            <div className="flex items-center space-x-2 text-sm text-yellow-400">
              <Brain className="h-4 w-4" />
              <span>Powered by AI Agents</span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">AI Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Intelligent Search Matching</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Price Anomaly Detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Market Analysis & Insights</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Fraud Prevention</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Supported Platforms</h4>
            <ul className="space-y-2 text-gray-400">
              <li>• Bikroy.com (AI Enhanced)</li>
              <li>• Carmudi.com.bd (AI Enhanced)</li>
              <li>• OLX Bangladesh (AI Enhanced)</li>
              <li>• CarDekho Bangladesh (AI Enhanced)</li>
              <li>• More platforms coming soon...</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Technology Stack</h4>
            <ul className="space-y-2 text-gray-400">
              <li>• Multi-Agent Architecture</li>
              <li>• OpenAI GPT Integration</li>
              <li>• Advanced Web Scraping</li>
              <li>• Real-time Price Analysis</li>
              <li>• Semantic Search Matching</li>
              <li>• Machine Learning Insights</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 CarCompare AI. Built with React, Node.js, and advanced AI technologies.
            </p>
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer