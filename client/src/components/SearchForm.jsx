import { useState } from 'react'
import { Search, Filter, Car, Calendar, Palette, DollarSign } from 'lucide-react'

const SearchForm = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState({
    model: '',
    brand: '',
    year: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    location: 'dhaka'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!filters.model.trim()) {
      alert('Please enter a car model to search')
      return
    }
    onSearch(filters)
  }

  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const carBrands = [
    'Toyota', 'Honda', 'Suzuki', 'Nissan', 'Mitsubishi', 
    'Hyundai', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Mazda'
  ]

  const colors = [
    'White', 'Black', 'Silver', 'Red', 'Blue', 'Gray', 'Green', 'Brown'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Search Filters</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Car className="h-4 w-4" />
              <span>Car Model *</span>
            </label>
            <input
              type="text"
              value={filters.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="e.g., Corolla, Civic, Swift"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Car className="h-4 w-4" />
              <span>Brand</span>
            </label>
            <select
              value={filters.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Any Brand</option>
              {carBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              <span>Year</span>
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Any Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Palette className="h-4 w-4" />
              <span>Color</span>
            </label>
            <select
              value={filters.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Any Color</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <span>Location</span>
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="dhaka">Dhaka</option>
              <option value="chittagong">Chittagong</option>
              <option value="sylhet">Sylhet</option>
              <option value="rajshahi">Rajshahi</option>
              <option value="khulna">Khulna</option>
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              <span>Min Price (BDT)</span>
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              placeholder="e.g., 500000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              <span>Max Price (BDT)</span>
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              placeholder="e.g., 2000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>{loading ? 'Searching...' : 'Search Cars'}</span>
        </button>
      </form>
    </div>
  )
}

export default SearchForm