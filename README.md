# Property Manager API

A GraphQL API for managing properties with weather data integration using Weatherstack API. Built with TypeScript, Node.js, Apollo Server, PostgreSQL, and Prisma.

## 🚀 Features

### ✅ All User Stories Implemented

1. **Query all properties** - `properties` query with pagination
2. **Sort by creation date** - `sortBy: CREATED_AT` parameter
3. **Filter by city/zip/state** - Filter parameters in query
4. **Query property details** - `property(id)` query
5. **Add new property** - `createProperty` mutation with Weatherstack integration
6. **Delete property** - `deleteProperty` mutation
7. **Weather data integration** - Automatic weather fetching during property creation

### 🏗️ Architecture

- **GraphQL API**: Apollo Server with type-safe resolvers
- **Database**: PostgreSQL with Prisma ORM
- **Weather Integration**: Weatherstack API for real-time weather data
- **Validation**: Comprehensive input validation for US addresses
- **Testing**: Vitest with >80% coverage
- **TypeScript**: Full type safety throughout the application
- **Code Quality**: ESLint + Prettier + Husky for consistent code style

## 🚀 Quick Development Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- pnpm package manager

### 🔥 One-Command Setup

```bash
# Install dependencies
pnpm install

# Setup development environment (database + sample data)
pnpm dev:setup

# Start the development server
pnpm dev
```

**That's it!** 🎉 Your GraphQL API is now running at `http://localhost:4000/graphql` with sample data loaded.

### 📊 What You Get

The development setup includes:

- ✅ **PostgreSQL database** running in Docker
- ✅ **5 sample properties** with realistic weather data
- ✅ **Mock weather service** (no API key required)
- ✅ **Hot reload** for development

### 🔧 Development Commands

```bash
# Validate entire development environment (recommended first time)
pnpm dev:test

# Start just the database
pnpm dev:db

# Stop the database
pnpm dev:db:stop

# Reset database with fresh sample data
pnpm db:reset && pnpm db:seed

# Code quality
pnpm lint        # Check for errors
pnpm format      # Format code
pnpm check       # Run all checks
```

### 🧪 Environment Validation

The `pnpm dev:test` command runs a comprehensive validation script that:

- ✅ Checks if Docker is running
- ✅ Starts PostgreSQL database in Docker
- ✅ Tests database connectivity
- ✅ Runs Prisma migrations
- ✅ Seeds database with sample data
- ✅ Validates that the GraphQL server starts correctly
- ✅ Tests API endpoint response

**When to use:**
- First time setting up the project
- After environment changes
- Before presenting to others
- When troubleshooting setup issues

This ensures your development environment is fully functional before you start coding.

### 🌐 Production Setup

For production, you'll need:

1. **Real PostgreSQL database**
2. **Weatherstack API key** from [weatherstack.com](https://weatherstack.com)

```env
DATABASE_URL="postgresql://user:pass@hostname:5432/properties"
WEATHERSTACK_API_KEY="your_real_api_key"
PORT=4000
NODE_ENV=production
```

```bash
pnpm build
pnpm start
```

### 🌤️ Weatherstack API Integration

The app automatically detects whether to use real or mock weather data:

- **Mock data**: When `WEATHERSTACK_API_KEY="demo_key"` or `"mock"`
- **Real data**: When you provide a valid Weatherstack API key

**Get a free API key:**
1. Visit [weatherstack.com](https://weatherstack.com)
2. Sign up for a free account (1,000 requests/month)
3. Copy your API key from the dashboard
4. Update your `.env` file

**Supported API features:**
- Current weather conditions
- Temperature, humidity, wind speed
- Weather descriptions and icons
- Geographic coordinates
- Timezone information

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

**Test Coverage: >80%**

- Unit tests for all services
- Integration tests for GraphQL resolvers
- Validation and error handling tests

## 📊 GraphQL API

### Queries

```graphql
# Get all properties with optional filtering and sorting
query GetProperties($filters: PropertyFilters) {
  properties(
    city: "Phoenix"
    state: "AZ"
    zipCode: "85001"
    sortBy: CREATED_AT
    sortOrder: DESC
    limit: 50
    offset: 0
  ) {
    id
    city
    street
    state
    zipCode
    lat
    long
    weatherData
    createdAt
    updatedAt
  }
}

# Get single property by ID
query GetProperty($id: String!) {
  property(id: $id) {
    id
    city
    street
    state
    zipCode
    lat
    long
    weatherData
    createdAt
    updatedAt
  }
}

# Health check
query Health {
  health
}
```

### Mutations

```graphql
# Create new property
mutation CreateProperty($input: CreatePropertyInput!) {
  createProperty(input: $input) {
    id
    city
    street
    state
    zipCode
    lat
    long
    weatherData
    createdAt
    updatedAt
  }
}

# Delete property
mutation DeleteProperty($id: String!) {
  deleteProperty(id: $id)
}
```

### Input Types

```graphql
input CreatePropertyInput {
  city: String! # e.g., "Phoenix"
  street: String! # e.g., "123 Main St"
  state: String! # US state abbreviation, e.g., "AZ"
  zipCode: String! # 5-digit zip code, e.g., "85001"
}
```

## 🌤️ Weather Data Integration

The API automatically fetches current weather data when creating a property using the Weatherstack API. The weather data includes:

- Current temperature, humidity, pressure
- Wind speed and direction
- Weather descriptions and icons
- Coordinates (lat/long) for the property location
- Local time and timezone information

## 🛡️ Validation & Error Handling

### Input Validation

- **City**: Required, non-empty string
- **Street**: Required, non-empty string
- **State**: Must be valid US state abbreviation (e.g., CA, NY, TX)
- **Zip Code**: Must be exactly 5 digits

### Error Handling

- GraphQL errors with proper error codes
- Weatherstack API error handling (timeouts, rate limits, invalid API keys)
- Database connection and query errors
- Comprehensive validation error messages

## 📁 Project Structure


```
src/
├── services/
│   ├── PropertyService.ts      # Core business logic for properties
│   ├── WeatherstackService.ts  # Weather API integration
│   └── ValidationService.ts   # Input validation
├── resolvers.ts               # GraphQL resolvers
├── schema.ts                  # GraphQL schema definition
├── types.ts                   # TypeScript interfaces
└── server.ts                  # Apollo Server setup
prisma/
└── schema.prisma              # Database schema
```

## 🗄️ Database Schema

```prisma
model Property {
  id          String   @id @default(cuid())
  city        String
  street      String
  state       String   @db.VarChar(2)    // US state abbreviation
  zipCode     String   @db.VarChar(5)    // 5-digit zip code
  lat         Float                      // Latitude from weather API
  long        Float                      // Longitude from weather API
  weatherData Json                       // Current weather object
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Indexes for efficient filtering
  @@index([city])
  @@index([state])
  @@index([zipCode])
  @@index([createdAt])
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/properties"
WEATHERSTACK_API_KEY="your_production_api_key"
PORT=4000
NODE_ENV=production
```

### Build Commands

```bash
# Build TypeScript
pnpm build

# Run database migrations
pnpm db:migrate

# Start production server
pnpm start
```

## 🔧 Development

### Database Commands

```bash
# Reset database (⚠️ destroys all data)
pnpm db:reset

# Generate Prisma client after schema changes
pnpm db:generate

# Create and apply new migration
pnpm db:migrate
```

## 📋 API Examples

### Create Property Example

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createProperty(input: { city: \"Phoenix\", street: \"123 Main St\", state: \"AZ\", zipCode: \"85001\" }) { id city weatherData } }"
  }'
```

### Sample GraphQL Queries

Visit `http://localhost:4000/graphql` in your browser to use GraphQL Playground with these queries:

**Get All Properties:**

```graphql
query GetAllProperties {
  properties {
    id
    city
    street
    state
    zipCode
    lat
    long
    createdAt
    weatherData
  }
}
```

**Filter Properties by State:**

```graphql
query GetPropertiesInArizona {
  properties(state: "AZ") {
    id
    city
    street
    weatherData
  }
}
```

**Create New Property:**

```graphql
mutation CreateProperty {
  createProperty(
    input: {
      city: "Austin"
      street: "123 South Street"
      state: "TX"
      zipCode: "73301"
    }
  ) {
    id
    city
    lat
    long
    weatherData
  }
}
```

**Delete Property:**

```graphql
mutation DeleteProperty {
  deleteProperty(id: "your-property-id-here")
}
```

---

## 🏝️ Future Improvements & Scalability

### 🔧 Code Quality & Architecture

- **Zod Integration**: Replace custom validation with Zod schemas for type-safe runtime validation
- **GraphQL Codegen**: Auto-generate TypeScript types from GraphQL schema
- **Input Sanitization**: Add XSS protection and advanced input sanitization
- **Input Validation**: SQL injection prevention, schema validation at GraphQL level
- **Error Monitoring**: Integrate Sentry or similar for production error tracking
- **Graceful Degradation**: Fallback mechanisms when external services fail
- **Rate Limiting**: Implement GraphQL query complexity analysis and rate limiting
- **Authentication/Authorization**: JWT-based auth with role-based access control (RBAC)
- **API Security**: CORS, CSP headers, request size limits
- **Redis**: Distributed caching for frequently accessed data
- **Database Indexing**: Advanced indexing strategies for complex queries
- **Message Queues**: Async processing with Redis/RabbitMQ for weather data updates
- **Load Balancing**: Multiple API instances with session affinity
- **Database Sharding**: Partition data by geographic regions
- **User Story Tests**: End-to-end tests for each user story scenario
- **Integration Tests**: Full API workflow testing with real database
- **Application Metrics**: Custom metrics with Grafana
- **Health Checks**: Comprehensive health endpoints for orchestration
- **Containerization**: Docker multi-stage builds with security scanning
- **Kubernetes**: Orchestration with auto-scaling and self-healing
- **CI/CD Pipeline**: Automated testing, security scans, and deployments
- **Infrastructure as Code**: Terraform/Pulumi for reproducible environments

### 📈 Business Features

- **Property Analytics**: Usage statistics, trends, and insights
- **Geospatial Queries**: "Find properties within 10 miles" with PostGIS
- **Property History**: Audit trail and change tracking

### 🌍 Global Scale Considerations

#### **Geographic Distribution**
- **Multi-Region Deployment**: Deploy API closer to users globally
- **Data Locality**: Store data in regions based on user location
