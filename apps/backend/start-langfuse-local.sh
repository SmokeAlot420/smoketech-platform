#!/bin/bash

# START LOCAL LANGFUSE - Self-hosted monitoring
echo "🚀 Starting Local Langfuse..."
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Start Langfuse services
echo ""
echo "📦 Starting Langfuse containers..."
docker-compose -f docker-compose.langfuse.yml up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.langfuse.yml ps | grep -q "Up"; then
    echo ""
    echo "✅ Langfuse is running!"
    echo ""
    echo "🌐 Access Langfuse UI at: http://localhost:3030"
    echo ""
    echo "📝 First Time Setup:"
    echo "1. Go to http://localhost:3030"
    echo "2. Create your account (it's local, so use any email)"
    echo "3. Create a new project"
    echo "4. Get your API keys from Settings > API Keys"
    echo "5. Add them to your .env file:"
    echo "   LANGFUSE_PUBLIC_KEY=your_public_key"
    echo "   LANGFUSE_SECRET_KEY=your_secret_key"
    echo "   LANGFUSE_URL=http://localhost:3030"
    echo ""
    echo "💡 To stop Langfuse: docker-compose -f docker-compose.langfuse.yml down"
    echo "💡 To view logs: docker-compose -f docker-compose.langfuse.yml logs -f"
else
    echo "❌ Failed to start Langfuse. Check Docker logs."
    docker-compose -f docker-compose.langfuse.yml logs
fi