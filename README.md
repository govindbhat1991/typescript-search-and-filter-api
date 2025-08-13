# Cloud Fence API

A GraphQL API for searching and managing security records with Elasticsearch integration.

## Features

- **GraphQL API** with Apollo Server
- **Elasticsearch** for fast full-text search
- **PostgreSQL** database with TypeORM
- **Redis** caching
- **Docker** containerization
- **Case-insensitive search** across multiple fields
- **Pagination** support with page information
- **Reference data** endpoints for dropdowns and filters

## Prerequisites

Before running this application, ensure you have the following installed on your system:

### Required Software

1. **Docker** (version 20.10 or higher)
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Or install Docker Engine for Linux: `sudo apt-get install docker.io docker-compose`

2. **Docker Compose** (version 2.0 or higher)
   - Usually comes with Docker Desktop
   - For Linux: `sudo apt-get install docker-compose`

3. **Git** (for cloning the repository)
   - Windows: Download from [Git for Windows](https://gitforwindows.org/)
   - macOS: `brew install git`
   - Linux: `sudo apt-get install git`

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended for better performance)
- **Disk Space**: At least 2GB free space
- **CPU**: 2 cores minimum (4 cores recommended)

### Port Requirements

The following ports must be available on your system:
- `3000` - GraphQL API
- `5432` - PostgreSQL database
- `6379` - Redis cache
- `9200` - Elasticsearch

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cloud-fence-g
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .example.env .env
```

Edit the `.env` file with your preferred settings:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=cloudfence

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://elastic:9200

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 3. Run the Application

Start all services using Docker Compose:

```bash
docker-compose up -d
```

This command will:
- Build the application container
- Start PostgreSQL database
- Start Redis cache
- Start Elasticsearch
- Start the GraphQL API server

### 4. Verify Installation

Check if all services are running:

```bash
docker-compose ps
```

You should see all services in "Up" status.

### 5. Access the Application

- **GraphQL Playground**: http://localhost:3000/graphql
- **GraphQL Endpoint**: http://localhost:3000/graphql

## Database Setup

### Initial Migration

Run database migrations to create the required tables:

```bash
docker-compose exec app npm run migration:run
```

### Seed Data (Optional)

Populate the database with sample data:

```bash
docker-compose exec app npm run seed
```

## API Usage

### GraphQL Queries

#### Search Records

```graphql
query SearchRecords {
  searchRecords(
    q: "hosting"
    page: 1
    size: 20
    threatLevelId: 4
  ) {
    total
    currentPage
    pageSize
    totalPages
    items {
      id
      addressIp
      organization
      threatDetails
      firstSeen
      lastSeen
      addressType {
        id
        name
      }
      threatLevel {
        id
        name
      }
      usageType {
        id
        name
      }
      country {
        id
        name
        code
      }
    }
  }
}
```

#### Get Reference Data

```graphql
# Get Address Types
query GetAddressTypes {
  addressTypes {
    id
    name
  }
}

# Get Countries
query GetCountries {
  countries {
    id
    code
    name
  }
}

# Get Threat Levels
query GetThreatLevels {
  threatLevels {
    id
    name
  }
}

# Get Usage Types
query GetUsageTypes {
  usageTypes {
    id
    name
  }
}
```

### Search Features

- **Case-insensitive search** across all text fields
- **Fuzzy matching** for better search results
- **IP address detection** and exact matching
- **Date range filtering** for firstSeen and lastSeen
- **Multiple filter combinations** (threat level, country, organization, etc.)

## Development

### Running in Development Mode

```bash
# Start with hot reload
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Running Tests

```bash
# Unit tests
docker-compose exec app npm run test:unit

# Integration tests
docker-compose exec app npm run test:integration

# E2E tests
docker-compose exec app npm run test:e2e
```

### Database Management

```bash
# Create a new migration
docker-compose exec app npm run migration:create -- src/migrations/MigrationName

# Generate migration from entity changes
docker-compose exec app npm run migration:generate -- src/migrations/MigrationName

# Show migration status
docker-compose exec app npm run migration:show

# Revert last migration
docker-compose exec app npm run migration:revert
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo lsof -i :3000
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Docker Permission Issues (Linux)**
   ```bash
   # Add your user to docker group
   sudo usermod -aG docker $USER
   
   # Log out and log back in, or run:
   newgrp docker
   ```

3. **Insufficient Memory for Elasticsearch**
   ```bash
   # Increase Docker memory limit in Docker Desktop settings
   # Or add to docker-compose.yml:
   environment:
     - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
   ```

4. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View PostgreSQL logs
   docker-compose logs postgres
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs elasticsearch
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f app
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GraphQL API   │    │   PostgreSQL    │    │  Elasticsearch  │
│   (NestJS)      │◄──►│   (Database)    │◄──►│   (Search)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Redis Cache   │
└─────────────────┘
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | API server port | `3000` |
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_DATABASE` | Database name | `cloudfence` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `ELASTICSEARCH_NODE` | Elasticsearch URL | `http://elastic:9200` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 