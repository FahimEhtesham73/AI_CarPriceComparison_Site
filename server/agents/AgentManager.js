import { BikroyAgent } from './BikroyAgent.js'
import { CarmudiAgent } from './CarmudiAgent.js'
import { OLXAgent } from './OLXAgent.js'
import { CarDekhoAgent } from './CarDekhoAgent.js'
import { EnhancedAIMatchingService } from '../services/EnhancedAIMatchingService.js'
import { logger } from '../utils/logger.js'

export class AgentManager {
  constructor() {
    this.agents = [
      new BikroyAgent(),
      new CarmudiAgent(),
      new OLXAgent(),
      new CarDekhoAgent()
    ]
    this.aiMatcher = new EnhancedAIMatchingService()
  }

  async searchAllPlatforms(filters) {
    logger.info('Starting AI-enhanced multi-agent search with filters:', filters)
    
    // Step 1: AI-enhanced query processing
    const searchContext = await this.aiMatcher.intelligentSearch(filters)
    logger.info('AI search context generated:', searchContext)

    // Step 2: Execute agents in parallel
    const searchPromises = this.agents.map(async (agent) => {
      try {
        logger.info(`Starting search with ${agent.constructor.name}`)
        
        // Use enhanced query for better results
        const enhancedFilters = this.enhanceFiltersWithAI(filters, searchContext)
        const results = await agent.search(enhancedFilters)
        
        logger.info(`${agent.constructor.name} found ${results.length} results`)
        return results
      } catch (error) {
        logger.error(`${agent.constructor.name} failed:`, error.message)
        return []
      }
    })

    const allResults = await Promise.all(searchPromises)
    const flatResults = allResults.flat()
    
    logger.info(`Total raw results collected: ${flatResults.length}`)

    // Step 3: AI-powered filtering and ranking
    const processedResults = await this.aiMatcher.filterAndRankResults(
      flatResults, 
      filters, 
      searchContext
    )
    
    logger.info(`Final results after AI processing: ${processedResults.results.length}`)
    
    return {
      results: processedResults.results,
      analysis: {
        totalFound: flatResults.length,
        afterFiltering: processedResults.results.length,
        pricePrediction: processedResults.analysis,
        searchEnhancement: searchContext.enhancedQuery
      },
      recommendations: processedResults.recommendations,
      searchContext
    }
  }

  enhanceFiltersWithAI(originalFilters, searchContext) {
    const enhanced = { ...originalFilters }
    
    if (searchContext.enhancedQuery?.standardized) {
      const std = searchContext.enhancedQuery.standardized
      
      // Use AI-standardized values if original is missing
      if (!enhanced.brand && std.brand) {
        enhanced.brand = std.brand
      }
      if (!enhanced.model && std.model) {
        enhanced.model = std.model
      }
      if (!enhanced.year && std.year) {
        enhanced.year = std.year
      }
    }
    
    // Add AI-suggested price range if not provided
    if (searchContext.pricePrediction && !enhanced.minPrice && !enhanced.maxPrice) {
      const prediction = searchContext.pricePrediction
      enhanced.suggestedMinPrice = prediction.minPrice
      enhanced.suggestedMaxPrice = prediction.maxPrice
    }
    
    return enhanced
  }

  getSupportedPlatforms() {
    return this.agents.map(agent => ({
      name: agent.constructor.name.replace('Agent', ''),
      status: 'active',
      aiEnhanced: true,
      features: ['intelligent_matching', 'price_analysis', 'anomaly_detection'],
      lastUpdate: new Date().toISOString()
    }))
  }

  getAgentStatus() {
    return {
      totalAgents: this.agents.length,
      activeAgents: this.agents.length,
      aiEnabled: true,
      features: {
        intelligentSearch: true,
        priceAnalysis: true,
        anomalyDetection: true,
        semanticMatching: true,
        recommendations: true
      },
      platforms: this.getSupportedPlatforms(),
      lastHealthCheck: new Date().toISOString()
    }
  }

  async getMarketInsights(filters) {
    try {
      // Quick search to get market data
      const results = await this.searchAllPlatforms(filters)
      
      if (!results.results.length) {
        return { error: 'No market data available' }
      }

      const prices = results.results.map(r => 
        this.extractNumericPrice(r.price)
      ).filter(p => p > 0)

      const insights = {
        marketSize: results.results.length,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
          average: prices.reduce((a, b) => a + b, 0) / prices.length
        },
        platformDistribution: this.getPlatformDistribution(results.results),
        aiPrediction: results.analysis.pricePrediction,
        recommendations: results.recommendations.slice(0, 3)
      }

      return insights
    } catch (error) {
      logger.error('Market insights generation failed:', error)
      return { error: 'Failed to generate market insights' }
    }
  }

  getPlatformDistribution(results) {
    const distribution = {}
    results.forEach(result => {
      distribution[result.site] = (distribution[result.site] || 0) + 1
    })
    return distribution
  }

  extractNumericPrice(priceStr) {
    if (!priceStr) return 0
    const numericStr = priceStr.replace(/[^\d.]/g, '')
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