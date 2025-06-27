import OpenAI from 'openai'
import { logger } from '../utils/logger.js'

export class OpenAIService {
  constructor() {
    this.client = null
    this.enabled = process.env.AI_ENABLED === 'true' && process.env.OPENAI_API_KEY
    
    if (this.enabled) {
      try {
        this.client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })
        logger.info('OpenAI service initialized successfully')
      } catch (error) {
        logger.error('Failed to initialize OpenAI service:', error.message)
        this.enabled = false
      }
    } else {
      logger.warn('OpenAI service disabled - AI_ENABLED=false or API key not provided')
    }
  }

  async enhanceSearchQuery(userQuery) {
    if (!this.enabled || !userQuery) {
      logger.info('OpenAI disabled or no query, using fallback enhancement')
      return this.getFallbackEnhancement(userQuery)
    }

    try {
      const prompt = `
        You are a car search expert for Bangladesh market. The user is searching for: "${userQuery}"
        
        Please extract and standardize the following information:
        - Brand (e.g., Toyota, Honda, BMW)
        - Model (e.g., Corolla, Civic, X5)
        - Year (if mentioned)
        - Any other relevant details
        
        Also suggest alternative spellings or similar models that might match in Bangladesh market.
        
        Return a JSON object with:
        {
          "standardized": {
            "brand": "extracted brand or null",
            "model": "extracted model or null", 
            "year": "extracted year or null",
            "original": "${userQuery}"
          },
          "alternatives": ["alternative1", "alternative2"],
          "searchTerms": ["term1", "term2", "term3"]
        }
      `

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })

      const result = JSON.parse(response.choices[0].message.content)
      logger.info('OpenAI query enhancement successful:', result)
      return result
    } catch (error) {
      logger.error('OpenAI query enhancement failed:', error.message)
      return this.getFallbackEnhancement(userQuery)
    }
  }

  getFallbackEnhancement(userQuery) {
    const alternatives = []
    const searchTerms = [userQuery]
    
    // Add common alternatives for popular models
    const commonAlternatives = {
      'corolla': ['corolla', 'carolla', 'corola'],
      'civic': ['civic', 'civick'],
      'swift': ['swift', 'suzuki swift'],
      'vitz': ['vitz', 'toyota vitz', 'yaris'],
      'axio': ['axio', 'toyota axio', 'corolla axio'],
      'allion': ['allion', 'toyota allion'],
      'premio': ['premio', 'toyota premio']
    }
    
    const queryLower = userQuery.toLowerCase()
    for (const [key, alts] of Object.entries(commonAlternatives)) {
      if (queryLower.includes(key)) {
        alternatives.push(...alts)
        searchTerms.push(...alts)
        break
      }
    }
    
    return {
      standardized: {
        brand: this.extractBrand(userQuery),
        model: this.extractModel(userQuery),
        year: this.extractYear(userQuery),
        original: userQuery
      },
      alternatives,
      searchTerms: [...new Set(searchTerms)] // Remove duplicates
    }
  }

  extractBrand(query) {
    const brands = ['toyota', 'honda', 'suzuki', 'nissan', 'mitsubishi', 'hyundai', 'bmw', 'mercedes', 'audi', 'ford', 'mazda']
    const queryLower = query.toLowerCase()
    
    for (const brand of brands) {
      if (queryLower.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1)
      }
    }
    return null
  }

  extractModel(query) {
    const models = ['corolla', 'civic', 'swift', 'vitz', 'axio', 'allion', 'premio', 'fit', 'vezel', 'x-trail', 'cr-v', 'rav4']
    const queryLower = query.toLowerCase()
    
    for (const model of models) {
      if (queryLower.includes(model)) {
        return model.charAt(0).toUpperCase() + model.slice(1)
      }
    }
    return query // Return original if no specific model found
  }

  extractYear(query) {
    const yearMatch = query.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  async generateEmbedding(text) {
    if (!this.enabled) return null

    try {
      const response = await this.client.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        input: text
      })

      return response.data[0].embedding
    } catch (error) {
      logger.error('OpenAI embedding generation failed:', error.message)
      return null
    }
  }

  async analyzePriceAnomalies(results) {
    if (!this.enabled || !results.length) return results

    try {
      const prices = results.map(r => ({
        site: r.site,
        title: r.title.substring(0, 50),
        price: this.extractNumericPrice(r.price)
      }))

      const prompt = `
        Analyze these car prices for anomalies in Bangladesh market:
        ${JSON.stringify(prices.slice(0, 10), null, 2)}
        
        Identify:
        1. Suspiciously low prices (possible scams)
        2. Overpriced listings
        3. Fair market value range
        4. Most reliable price estimates
        
        Return JSON:
        {
          "analysis": {
            "averagePrice": number,
            "priceRange": {"min": number, "max": number},
            "suspiciousListings": [indices],
            "recommendedListings": [indices],
            "marketInsights": "brief analysis"
          }
        }
      `

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 800
      })

      const analysis = JSON.parse(response.choices[0].message.content)
      
      // Add AI insights to results
      return results.map((result, index) => ({
        ...result,
        aiInsights: {
          suspicious: analysis.analysis.suspiciousListings?.includes(index),
          recommended: analysis.analysis.recommendedListings?.includes(index),
          marketAnalysis: index < 3 ? analysis.analysis.marketInsights : null
        }
      }))
    } catch (error) {
      logger.error('OpenAI price analysis failed:', error.message)
      return results
    }
  }

  async predictPriceRange(carDetails) {
    if (!this.enabled) return null

    try {
      const prompt = `
        Based on the following car details, predict a reasonable price range in BDT for the Bangladesh market:
        
        Brand: ${carDetails.brand || 'Unknown'}
        Model: ${carDetails.model || 'Unknown'}
        Year: ${carDetails.year || 'Unknown'}
        Location: ${carDetails.location || 'Dhaka'}
        
        Consider:
        - Current market conditions in Bangladesh
        - Depreciation rates
        - Popular models and their typical pricing
        - Import duties and taxes
        
        Return JSON:
        {
          "prediction": {
            "minPrice": number,
            "maxPrice": number,
            "averagePrice": number,
            "confidence": "high/medium/low",
            "factors": ["factor1", "factor2"],
            "recommendation": "brief advice"
          }
        }
      `

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      })

      const prediction = JSON.parse(response.choices[0].message.content)
      logger.info('Price prediction generated:', prediction)
      return prediction.prediction
    } catch (error) {
      logger.error('OpenAI price prediction failed:', error.message)
      return null
    }
  }

  async generateCarRecommendations(userPreferences, searchResults) {
    if (!this.enabled || !searchResults.length) return []

    try {
      const prompt = `
        Based on user preferences and available cars, generate personalized recommendations:
        
        User Preferences:
        ${JSON.stringify(userPreferences, null, 2)}
        
        Available Cars (first 5):
        ${JSON.stringify(searchResults.slice(0, 5).map(car => ({
          title: car.title,
          price: car.price,
          site: car.site,
          specs: car.specs
        })), null, 2)}
        
        Generate 3 personalized recommendations with reasons.
        
        Return JSON:
        {
          "recommendations": [
            {
              "carIndex": number,
              "reason": "why this car is recommended",
              "pros": ["pro1", "pro2"],
              "cons": ["con1", "con2"],
              "score": number (1-10)
            }
          ]
        }
      `

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1000
      })

      const recommendations = JSON.parse(response.choices[0].message.content)
      return recommendations.recommendations || []
    } catch (error) {
      logger.error('OpenAI recommendations failed:', error.message)
      return []
    }
  }

  extractNumericPrice(priceStr) {
    if (!priceStr) return 0
    
    // Handle Bengali currency
    let cleanStr = priceStr.replace(/[৳,\s]/g, '')
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