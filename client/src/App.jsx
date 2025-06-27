import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import SearchForm from './components/SearchForm'
import EnhancedResultsDisplay from './components/EnhancedResultsDisplay'
import LoadingSpinner from './components/LoadingSpinner'
import Header from './components/Header'
import Footer from './components/Footer'
import { searchCars } from './services/api'
import './App.css'

function App() {
  const [searchData, setSearchData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [currentFilters, setCurrentFilters] = useState(null)

  const handleSearch = async (filters) => {
    setLoading(true)
    setError(null)
    setSearchPerformed(true)
    setCurrentFilters(filters)
    
    try {
      const data = await searchCars(filters)
      setSearchData(data)
    } catch (err) {
      setError('Failed to fetch car prices. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="gradient-text">AI-Powered</span> Car Price Comparison
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Compare car prices across multiple platforms with intelligent AI analysis
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
              <span>🤖 Multi-Agent Scraping</span>
              <span>•</span>
              <span>🧠 AI Price Analysis</span>
              <span>•</span>
              <span>📊 Market Insights</span>
            </p>
          </div>

          <SearchForm onSearch={handleSearch} loading={loading} />

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {loading && <LoadingSpinner />}

          {!loading && searchPerformed && (
            <EnhancedResultsDisplay 
              searchData={searchData} 
              filters={currentFilters}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App