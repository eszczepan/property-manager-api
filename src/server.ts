import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `
  type Query {
    hello: String!
    health: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
    health: () => "ok",
  },
};

async function main() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT ?? 4000) },
  });

  console.log(`🚀 GraphQL ready at ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
