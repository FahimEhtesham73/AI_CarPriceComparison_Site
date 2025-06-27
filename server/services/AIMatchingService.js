import Fuse from 'fuse.js'
import { logger } from '../utils/logger.js'

export class AIMatchingService {
  constructor() {
    this.fuseOptions = {
      keys: ['title'],
      threshold: 0.4, // Lower threshold = more strict matching
      includeScore: true
    }
  }

  async filterAndRankResults(results, filters) {
    if (!results || results.length === 0) {
      return []
    }

    logger.info(`AI Matching: Processing ${results.length} raw results`)

    // Step 1: Basic filtering
    let filteredResults = this.basicFilter(results, filters)
    logger.info(`After basic filtering: ${filteredResults.length} results`)

    // Step 2: Fuzzy matching for model names
    if (filters.model) {
      filteredResults = this.fuzzyMatchModel(filteredResults, filters.model)
      logger.info(`After fuzzy matching: ${filteredResults.length} results`)
    }

    // Step 3: Price range filtering
    if (filters.minPrice || filters.maxPrice) {
      filteredResults = this.priceFilter(filteredResults, filters.minPrice, filters.maxPrice)
      logger.info(`After price filtering: ${filteredResults.length} results`)
    }

    // Step 4: Year filtering
    if (filters.year) {
      filteredResults = this.yearFilter(filteredResults, filters.year)
      logger.info(`After year filtering: ${filteredResults.length} results`)
    }

    // Step 5: Remove duplicates
    filteredResults = this.removeDuplicates(filteredResults)
    logger.info(`After duplicate removal: ${filteredResults.length} results`)

    // Step 6: Rank by relevance and price
    filteredResults = this.rankResults(filteredResults, filters)

    return filteredResults
  }

  basicFilter(results, filters) {
    return results.filter(result => {
      // Filter out results with invalid prices
      if (!result.price || result.price.trim() === '') {
        return false
      }

      // Filter by color if specified
      if (filters.color && result.specs?.color) {
        const resultColor = result.specs.color.toLowerCase()
        const filterColor = filters.color.toLowerCase()
        if (!resultColor.includes(filterColor)) {
          return false
        }
      }

      // Filter by location if specified
      if (filters.location && result.specs?.location) {
        const resultLocation = result.specs.location.toLowerCase()
        const filterLocation = filters.location.toLowerCase()
        if (!resultLocation.includes(filterLocation)) {
          return false
        }
      }

      return true
    })
  }

  fuzzyMatchModel(results, modelQuery) {
    const fuse = new Fuse(results, this.fuseOptions)
    const searchResults = fuse.search(modelQuery)
    
    // Return results with good enough match scores
    return searchResults
      .filter(result => result.score < 0.6) // Only keep good matches
      .map(result => result.item)
  }

  priceFilter(results, minPrice, maxPrice) {
    return results.filter(result => {
      const price = this.extractNumericPrice(result.price)
      
      if (minPrice && price < parseInt(minPrice)) {
        return false
      }
      
      if (maxPrice && price > parseInt(maxPrice)) {
        return false
      }
      
      return true
    })
  }

  yearFilter(results, targetYear) {
    const yearTolerance = 2 // Allow ±2 years
    
    return results.filter(result => {
      const resultYear = result.specs?.year || this.extractYearFromTitle(result.title)
      
      if (!resultYear) return true // Keep if year is unknown
      
      return Math.abs(resultYear - parseInt(targetYear)) <= yearTolerance
    })
  }

  removeDuplicates(results) {
    const seen = new Set()
    return results.filter(result => {
      // Create a unique key based on title and price
      const key = `${result.title.toLowerCase().trim()}-${result.price}`
      
      if (seen.has(key)) {
        return false
      }
      
      seen.add(key)
      return true
    })
  }

  rankResults(results, filters) {
    return results.sort((a, b) => {
      // Primary sort: by price (ascending)
      const priceA = this.extractNumericPrice(a.price)
      const priceB = this.extractNumericPrice(b.price)
      
      if (priceA !== priceB) {
        return priceA - priceB
      }
      
      // Secondary sort: by year (descending - newer first)
      const yearA = a.specs?.year || 0
      const yearB = b.specs?.year || 0
      
      if (yearA !== yearB) {
        return yearB - yearA
      }
      
      // Tertiary sort: by site reliability (Bikroy > Carmudi > OLX > CarDekho)
      const siteRanking = { 'Bikroy': 4, 'Carmudi': 3, 'OLX': 2, 'CarDekho': 1 }
      const rankA = siteRanking[a.site] || 0
      const rankB = siteRanking[b.site] || 0
      
      return rankB - rankA
    })
  }

  extractNumericPrice(priceStr) {
    if (!priceStr) return 0
    
    // Remove all non-numeric characters except decimal points
    const numericStr = priceStr.replace(/[^\d.]/g, '')
    const price = parseFloat(numericStr) || 0
    
    // Handle different price formats (lakhs, crores, etc.)
    if (priceStr.toLowerCase().includes('lakh') || priceStr.toLowerCase().includes('lac')) {
      return price * 100000
    }
    
    if (priceStr.toLowerCase().includes('crore')) {
      return price * 10000000
    }
    
    return price
  }

  extractYearFromTitle(title) {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  // Advanced AI features (can be extended with OpenAI API)
  async enhanceWithAI(results, filters) {
    // This method can be extended to use OpenAI API for:
    // 1. Better text matching
    // 2. Price prediction
    // 3. Anomaly detection
    // 4. Sentiment analysis of listings
    
    // For now, return results as-is
    return results
  }
}