import Fuse from 'fuse.js'
import stringSimilarity from 'string-similarity'
import natural from 'natural'
import { OpenAIService } from './OpenAIService.js'
import { logger } from '../utils/logger.js'

export class EnhancedAIMatchingService {
  constructor() {
    this.openAI = new OpenAIService()
    this.fuseOptions = {
      keys: ['title'],
      threshold: 0.8, // Increased threshold for more lenient matching
      includeScore: true
    }
    
    // Initialize NLP tools
    this.stemmer = natural.PorterStemmer
    this.tokenizer = new natural.WordTokenizer()
    this.distance = natural.JaroWinklerDistance
  }

  async intelligentSearch(filters) {
    logger.info('Starting intelligent search with AI enhancement')
    
    // Step 1: Enhance search query with OpenAI (fallback if AI fails)
    let enhancedQuery
    try {
      enhancedQuery = await this.openAI.enhanceSearchQuery(filters.model || '')
    } catch (error) {
      logger.warn('OpenAI enhancement failed, using fallback:', error.message)
      enhancedQuery = {
        standardized: {
          brand: filters.brand,
          model: filters.model,
          original: filters.model
        },
        alternatives: [filters.model],
        searchTerms: [filters.model]
      }
    }
    
    // Step 2: Generate price predictions (fallback if AI fails)
    let pricePrediction
    try {
      pricePrediction = await this.openAI.predictPriceRange(filters)
    } catch (error) {
      logger.warn('Price prediction failed, using fallback:', error.message)
      pricePrediction = null
    }
    
    return {
      enhancedQuery,
      pricePrediction,
      originalFilters: filters
    }
  }

  async filterAndRankResults(results, filters, searchContext = {}) {
    if (!results || results.length === 0) {
      logger.warn('No results to filter')
      return { results: [], analysis: null, recommendations: [] }
    }

    logger.info(`AI Matching: Processing ${results.length} raw results`)

    // Step 1: Basic filtering (more lenient)
    let filteredResults = this.basicFilter(results, filters)
    logger.info(`After basic filtering: ${filteredResults.length} results`)

    // Step 2: AI-powered fuzzy matching (more lenient)
    if (filters.model && filteredResults.length > 0) {
      filteredResults = await this.aiEnhancedFuzzyMatch(filteredResults, filters, searchContext.enhancedQuery)
      logger.info(`After AI fuzzy matching: ${filteredResults.length} results`)
    }

    // If still no results after fuzzy matching, be more lenient
    if (filteredResults.length === 0 && results.length > 0) {
      logger.warn('No results after fuzzy matching, using more lenient approach')
      filteredResults = this.lenientFilter(results, filters)
      logger.info(`After lenient filtering: ${filteredResults.length} results`)
    }

    // Step 3: Semantic similarity matching (only if we have results)
    if (filteredResults.length > 0) {
      filteredResults = await this.semanticMatching(filteredResults, filters)
      logger.info(`After semantic matching: ${filteredResults.length} results`)
    }

    // Step 4: Price range filtering with AI insights (more lenient)
    if (filteredResults.length > 0 && (filters.minPrice || filters.maxPrice || searchContext.pricePrediction)) {
      filteredResults = this.intelligentPriceFilter(filteredResults, filters, searchContext.pricePrediction)
      logger.info(`After intelligent price filtering: ${filteredResults.length} results`)
    }

    // Step 5: Remove duplicates with AI
    if (filteredResults.length > 0) {
      filteredResults = await this.aiDuplicateRemoval(filteredResults)
      logger.info(`After AI duplicate removal: ${filteredResults.length} results`)
    }

    // Step 6: AI price anomaly detection (optional, don't filter out)
    if (filteredResults.length > 0) {
      try {
        filteredResults = await this.openAI.analyzePriceAnomalies(filteredResults)
        logger.info(`After price anomaly analysis: ${filteredResults.length} results`)
      } catch (error) {
        logger.warn('Price anomaly analysis failed:', error.message)
      }
    }

    // Step 7: Intelligent ranking
    if (filteredResults.length > 0) {
      filteredResults = await this.aiRanking(filteredResults, filters)
    }

    // Step 8: Generate AI recommendations
    let recommendations = []
    try {
      recommendations = await this.openAI.generateCarRecommendations(filters, filteredResults)
    } catch (error) {
      logger.warn('AI recommendations failed:', error.message)
    }

    return {
      results: filteredResults,
      analysis: searchContext.pricePrediction,
      recommendations
    }
  }

  // More lenient basic filtering
  basicFilter(results, filters) {
    return results.filter(result => {
      // Only filter out results with completely invalid data
      if (!result.title || result.title.trim().length < 3) {
        return false
      }

      if (!result.price || result.price.trim() === '' || result.price === '0') {
        return false
      }

      // Don't filter by color or location in basic filter - too restrictive
      return true
    })
  }

  // New lenient filter for when strict filtering fails
  lenientFilter(results, filters) {
    const modelKeywords = filters.model ? filters.model.toLowerCase().split(' ') : []
    const brandKeywords = filters.brand ? filters.brand.toLowerCase().split(' ') : []
    
    return results.filter(result => {
      if (!result.title || !result.price) return false
      
      const title = result.title.toLowerCase()
      
      // Check if any model keyword appears in title
      if (modelKeywords.length > 0) {
        const hasModelMatch = modelKeywords.some(keyword => 
          keyword.length > 2 && title.includes(keyword)
        )
        if (hasModelMatch) return true
      }
      
      // Check if any brand keyword appears in title
      if (brandKeywords.length > 0) {
        const hasBrandMatch = brandKeywords.some(keyword => 
          keyword.length > 2 && title.includes(keyword)
        )
        if (hasBrandMatch) return true
      }
      
      return false
    })
  }

  async aiEnhancedFuzzyMatch(results, filters, enhancedQuery) {
    const searchTerms = []
    
    // Add original search terms
    if (filters.model) searchTerms.push(filters.model)
    if (filters.brand) searchTerms.push(filters.brand)
    
    // Add AI enhanced terms if available
    if (enhancedQuery?.searchTerms) {
      searchTerms.push(...enhancedQuery.searchTerms)
    }
    if (enhancedQuery?.alternatives) {
      searchTerms.push(...enhancedQuery.alternatives)
    }
    
    let matchedResults = []
    
    // Try each search term
    for (const term of searchTerms) {
      if (!term || term.length < 2) continue
      
      const fuse = new Fuse(results, {
        ...this.fuseOptions,
        threshold: 0.9 // Very lenient threshold
      })
      
      const searchResults = fuse.search(term)
      
      matchedResults.push(...searchResults
        .filter(result => result.score < 0.95) // Very lenient score
        .map(result => ({
          ...result.item,
          matchScore: result.score,
          matchedTerm: term
        }))
      )
    }

    // If no fuzzy matches, try simple string matching
    if (matchedResults.length === 0) {
      logger.info('No fuzzy matches found, trying simple string matching')
      
      for (const term of searchTerms) {
        if (!term || term.length < 2) continue
        
        const simpleMatches = results.filter(result => 
          result.title.toLowerCase().includes(term.toLowerCase())
        )
        
        matchedResults.push(...simpleMatches.map(result => ({
          ...result,
          matchScore: 0.5,
          matchedTerm: term
        })))
      }
    }

    // Remove duplicates and return best matches
    const uniqueResults = this.removeDuplicatesByTitle(matchedResults)
    return uniqueResults.sort((a, b) => (a.matchScore || 0) - (b.matchScore || 0))
  }

  async semanticMatching(results, filters) {
    if (!filters.model) return results
    
    // Use natural language processing for better matching
    const queryTokens = this.tokenizer.tokenize(filters.model?.toLowerCase() || '')
    const queryStemmed = queryTokens.map(token => this.stemmer.stem(token))
    
    return results.filter(result => {
      const titleTokens = this.tokenizer.tokenize(result.title.toLowerCase())
      const titleStemmed = titleTokens.map(token => this.stemmer.stem(token))
      
      // Calculate semantic similarity
      const similarity = this.calculateSemanticSimilarity(queryStemmed, titleStemmed)
      result.semanticScore = similarity
      
      return similarity > 0.1 // Very lenient semantic similarity threshold
    })
  }

  calculateSemanticSimilarity(tokens1, tokens2) {
    let matches = 0
    const totalTokens = Math.max(tokens1.length, tokens2.length)
    
    if (totalTokens === 0) return 0
    
    for (const token1 of tokens1) {
      for (const token2 of tokens2) {
        if (token1 === token2 || this.distance(token1, token2) > 0.7) {
          matches++
          break
        }
      }
    }
    
    return matches / totalTokens
  }

  intelligentPriceFilter(results, filters, pricePrediction) {
    return results.filter(result => {
      const price = this.extractNumericPrice(result.price)
      
      if (price <= 0) return false // Filter out invalid prices
      
      // Use AI prediction if available (but don't filter too strictly)
      if (pricePrediction) {
        const { minPrice, maxPrice } = pricePrediction
        const buffer = (maxPrice - minPrice) * 0.5 // 50% buffer - very lenient
        
        if (price < minPrice - buffer || price > maxPrice + buffer) {
          result.priceFlag = 'outside_predicted_range'
          // Don't filter out, just flag
        }
      }
      
      // Apply user filters (if provided)
      if (filters.minPrice && price < parseInt(filters.minPrice)) {
        return false
      }
      
      if (filters.maxPrice && price > parseInt(filters.maxPrice)) {
        return false
      }
      
      return true
    })
  }

  async aiDuplicateRemoval(results) {
    const uniqueResults = []
    const seenTitles = new Set()
    
    for (const result of results) {
      let isDuplicate = false
      
      // Check against existing titles using string similarity
      for (const seenTitle of seenTitles) {
        const similarity = stringSimilarity.compareTwoStrings(
          result.title.toLowerCase(),
          seenTitle.toLowerCase()
        )
        
        if (similarity > 0.9) { // More lenient duplicate detection
          isDuplicate = true
          break
        }
      }
      
      if (!isDuplicate) {
        uniqueResults.push(result)
        seenTitles.add(result.title)
      }
    }
    
    return uniqueResults
  }

  async aiRanking(results, filters) {
    return results.sort((a, b) => {
      // Multi-factor AI ranking
      let scoreA = 0
      let scoreB = 0
      
      // Factor 1: Price (lower is better, but not too low)
      const priceA = this.extractNumericPrice(a.price)
      const priceB = this.extractNumericPrice(b.price)
      const avgPrice = results.reduce((sum, r) => sum + this.extractNumericPrice(r.price), 0) / results.length
      
      scoreA += this.calculatePriceScore(priceA, avgPrice)
      scoreB += this.calculatePriceScore(priceB, avgPrice)
      
      // Factor 2: Match quality
      scoreA += (1 - (a.matchScore || 0.5)) * 30
      scoreB += (1 - (b.matchScore || 0.5)) * 30
      
      // Factor 3: Semantic similarity
      scoreA += (a.semanticScore || 0) * 20
      scoreB += (b.semanticScore || 0) * 20
      
      // Factor 4: Site reliability
      const siteScores = { 'Bikroy': 25, 'Carmudi': 20, 'OLX': 15, 'CarDekho': 10 }
      scoreA += siteScores[a.site] || 5
      scoreB += siteScores[b.site] || 5
      
      // Factor 5: AI insights
      if (a.aiInsights?.recommended) scoreA += 15
      if (b.aiInsights?.recommended) scoreB += 15
      if (a.aiInsights?.suspicious) scoreA -= 10 // Less penalty
      if (b.aiInsights?.suspicious) scoreB -= 10
      
      // Factor 6: Completeness of data
      scoreA += this.calculateCompletenessScore(a)
      scoreB += this.calculateCompletenessScore(b)
      
      return scoreB - scoreA // Higher score first
    })
  }

  calculatePriceScore(price, avgPrice) {
    if (avgPrice === 0) return 10
    
    // Optimal price is slightly below average
    const optimalPrice = avgPrice * 0.9
    const deviation = Math.abs(price - optimalPrice) / avgPrice
    return Math.max(0, 20 - (deviation * 20))
  }

  calculateCompletenessScore(result) {
    let score = 0
    if (result.image) score += 5
    if (result.specs?.year) score += 3
    if (result.specs?.color) score += 2
    if (result.specs?.location) score += 2
    if (result.specs?.mileage) score += 3
    return score
  }

  removeDuplicatesByTitle(results) {
    const seen = new Map()
    return results.filter(result => {
      const key = result.title.toLowerCase().trim()
      if (seen.has(key)) {
        return false
      }
      seen.set(key, true)
      return true
    })
  }

  extractNumericPrice(priceStr) {
    if (!priceStr) return 0
    
    // Handle Bengali numbers and currency
    let cleanStr = priceStr.replace(/[৳,\s]/g, '')
    
    // Extract numeric part
    const numericStr = cleanStr.replace(/[^\d.]/g, '')
    const price = parseFloat(numericStr) || 0
    
    if (priceStr.toLowerCase().includes('lakh') || priceStr.toLowerCase().includes('lac')) {
      return price * 100000
    }
    if (priceStr.toLowerCase().includes('crore')) {
      return price * 10000000
    }
    return price
  }
}