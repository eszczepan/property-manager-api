#!/bin/bash

echo "🧪 Testing development setup..."

# Test if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Test if we can start PostgreSQL
echo "🗄️  Starting PostgreSQL..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Test database connection
if npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Run migrations
echo "🔄 Running database migrations..."
pnpm run db:migrate --name init

# Seed database
echo "🌱 Seeding database with sample data..."
pnpm db:seed

# Test if server starts
echo "🚀 Testing server startup..."
timeout 30s pnpm dev &
SERVER_PID=$!

sleep 10

# Test GraphQL endpoint
if curl -s http://localhost:4000/graphql >/dev/null; then
    echo "✅ Server is responding on port 4000"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Server is not responding"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Development setup test completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm dev' to start the development server"
echo "2. Open http://localhost:4000/graphql in your browser"
echo "3. Try the sample GraphQL queries from README.md"
