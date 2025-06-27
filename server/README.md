# Car Price Comparison Backend

AI-powered multi-agent car price comparison system backend built with Node.js and Express.

## Features

- **Multi-Agent Architecture**: Separate agents for each platform (Bikroy, Carmudi, OLX, CarDekho)
- **Intelligent Scraping**: Uses Puppeteer for dynamic content scraping
- **AI-Powered Matching**: Fuzzy search and intelligent result filtering
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Comprehensive error handling and logging
- **Scalable Design**: Modular architecture for easy extension

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /api/search
Search for cars across multiple platforms.

**Request Body:**
```json
{
  "model": "Corolla",
  "brand": "Toyota",
  "year": "2020",
  "color": "White",
  "minPrice": "1000000",
  "maxPrice": "2000000",
  "location": "dhaka"
}
```

**Response:**
```json
[
  {
    "site": "Bikroy",
    "title": "Toyota Corolla 2020 - White",
    "price": "1,500,000",
    "link": "https://bikroy.com/ad/...",
    "image": "https://bikroy.com/images/...",
    "specs": {
      "year": 2020,
      "color": "White",
      "location": "Dhaka"
    }
  }
]
```

### GET /api/platforms
Get list of supported platforms.

### GET /api/agents/status
Get status of all scraping agents.

### GET /health
Health check endpoint.

## Architecture

### Agents
- **BaseAgent**: Abstract base class for all scraping agents
- **BikroyAgent**: Scrapes Bikroy.com
- **CarmudiAgent**: Scrapes Carmudi.com.bd
- **OLXAgent**: Scrapes OLX Bangladesh
- **CarDekhoAgent**: Scrapes CarDekho Bangladesh

### Services
- **AIMatchingService**: Intelligent result filtering and ranking
- **AgentManager**: Coordinates all scraping agents

### Middleware
- **Validation**: Request parameter validation
- **Error Handler**: Centralized error handling
- **Rate Limiting**: Request rate limiting

## Adding New Platforms

1. Create a new agent class extending `BaseAgent`
2. Implement the `search(filters)` method
3. Add the agent to `AgentManager`
4. Update the supported platforms list

Example:
```javascript
import { BaseAgent } from './BaseAgent.js'

export class NewPlatformAgent extends BaseAgent {
  constructor() {
    super('NewPlatform')
    this.baseUrl = 'https://newplatform.com'
  }

  async search(filters) {
    // Implement scraping logic
  }
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `DATABASE_URL`: Database URL (optional)
- `REDIS_URL`: Redis URL (optional)

## Deployment

1. Set environment variables
2. Install production dependencies: `npm ci --production`
3. Start the server: `npm start`

## Legal Considerations

- Respects robots.txt files
- Implements rate limiting
- Uses reasonable delays between requests
- Follows ethical scraping practices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request