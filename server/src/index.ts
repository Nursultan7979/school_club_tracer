import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { getAuthContext, AuthContext } from './utils/auth';
import { verifyToken } from './utils/jwt';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_club_tracker';

async function connectDatabase() {
  try {
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { default: initDatabase } = await import('./scripts/init-db');
      await initDatabase();
    } catch (error: any) {
      console.log('ℹ️  Database initialization skipped or already done:', error.message);
    }
    
    return true;
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const authHeader = ctx.connectionParams?.authorization as string;
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
          try {
            const payload = verifyToken(token);
            return { user: payload };
          } catch (error) {
            return {};
          }
        }
        return {};
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: ({ req }): AuthContext => {
      return getAuthContext(req);
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        extensions: error.extensions,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`WebSocket server ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

connectDatabase()
  .then(() => {
    console.log('Starting server...');
    return startServer();
  })
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });

