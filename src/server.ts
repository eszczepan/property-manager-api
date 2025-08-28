import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js';
import { PropertyService } from './services/PropertyService.js';
import { WeatherstackService } from './services/WeatherstackService.js';

dotenv.config();

const prisma = new PrismaClient();
const weatherstackService = new WeatherstackService(
  process.env.WEATHERSTACK_API_KEY || 'demo_key'
);
const propertyService = new PropertyService(prisma, weatherstackService);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const { url } = await startStandaloneServer(server, {
      listen: { port: Number(process.env.PORT ?? 4000) },
      context: async () => ({
        propertyService,
      }),
    });

    console.log(`🚀 Property Manager API ready at ${url}`);
    console.log('📊 GraphQL Playground available for development');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(err => {
  console.error('❌ Server error:', err);
  process.exit(1);
});
