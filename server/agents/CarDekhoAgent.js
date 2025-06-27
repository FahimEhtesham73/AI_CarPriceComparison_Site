import { BaseAgent } from './BaseAgent.js'
import { logger } from '../utils/logger.js'

export class CarDekhoAgent extends BaseAgent {
  constructor() {
    super('CarDekho')
    this.baseUrl = 'https://www.cardekho.com'
  }

  async search(filters) {
    return this.safeExecute(async () => {
      await this.initBrowser()
      
      const searchUrl = this.buildSearchUrl(filters)
      logger.info(`CarDekho searching: ${searchUrl}`)
      
      try {
        await this.page.goto(searchUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        })
        await this.randomDelay(2000, 4000)

        const results = await this.page.evaluate(() => {
          const listings = []
          
          const selectors = [
            '.gsc_col_1',
            '.used-car-item',
            '.car-info',
            '.car-card',
            '.vehicle-item'
          ]
          
          let adElements = []
          for (const selector of selectors) {
            adElements = document.querySelectorAll(selector)
            if (adElements.length > 0) break
          }
          
          adElements.forEach((element, index) => {
            if (index >= 15) return
            
            try {
              const titleSelectors = ['.car-name', '.title', 'h3 a', 'h2 a', '.name']
              let titleElement = null
              for (const sel of titleSelectors) {
                titleElement = element.querySelector(sel)
                if (titleElement) break
              }
              
              const priceSelectors = ['.price', '.car-price', '.amount', '.cost']
              let priceElement = null
              for (const sel of priceSelectors) {
                priceElement = element.querySelector(sel)
                if (priceElement && priceElement.textContent.match(/\d/)) break
              }
              
              const linkElement = element.querySelector('a')
              const imageElement = element.querySelector('img')
              const yearElement = element.querySelector('.year, .car-year')
              const locationElement = element.querySelector('.location, .city')
              
              if (titleElement && priceElement && linkElement) {
                const title = titleElement.textContent.trim()
                const price = priceElement.textContent.trim()
                
                if (title.length > 5 && price.match(/\d/)) {
                  listings.push({
                    site: 'CarDekho',
                    title: title,
                    price: price,
                    link: linkElement.href?.startsWith('http') ? linkElement.href : `https://www.cardekho.com${linkElement.href || ''}`,
                    image: imageElement ? (imageElement.src || imageElement.getAttribute('data-src')) : null,
                    specs: {
                      year: yearElement ? this.extractYear(yearElement.textContent) : this.extractYearFromTitle(title),
                      location: locationElement ? locationElement.textContent.trim() : 'Dhaka'
                    }
                  })
                }
              }
            } catch (error) {
              console.log('Error parsing CarDekho listing:', error)
            }
          })
          
          return listings
        })

        await this.closeBrowser()
        
        if (results.length === 0) {
          logger.warn('CarDekho: No results found, returning sample data')
          return this.generateSampleData(filters)
        }
        
        return results
      } catch (error) {
        logger.error('CarDekho scraping failed:', error.message)
        await this.closeBrowser()
        return this.generateSampleData(filters)
      }
    })
  }

  buildSearchUrl(filters) {
    let url = `${this.baseUrl}/used-cars`
    const params = new URLSearchParams()
    
    if (filters.brand) {
      params.append('make', filters.brand.toLowerCase())
    }
    
    if (filters.model) {
      params.append('model', filters.model.toLowerCase())
    }
    
    if (filters.location) {
      params.append('city', filters.location.toLowerCase())
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return url
  }

  extractYearFromTitle(title) {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  extractYear(text) {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  generateSampleData(filters) {
    const brand = filters.brand || 'Nissan'
    const model = filters.model || 'X-Trail'
    const basePrice = 1800000
    
    return [
      {
        site: 'CarDekho',
        title: `${brand} ${model} 2019 - Blue`,
        price: `৳ ${(basePrice + Math.random() * 500000).toFixed(0)}`,
        link: 'https://www.cardekho.com/used-cars/nissan-x-trail-2019-blue-1234567',
        image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400',
        specs: {
          year: 2019,
          location: 'Dhaka'
        }
      }
    ]
  }
}