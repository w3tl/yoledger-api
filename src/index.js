import '@babel/polyfill'; // eslint-disable-line
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { MongoClient } from 'mongodb';
import config from './config';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import startup from './startup';
import context from './context';

const mongoUri = config.get('mongoUri');

startup().then(async () => {
  const client = await MongoClient.connect(mongoUri, {
    bufferMaxEntries: 0, // Turn off all buffering, error immediately if disconnected
    useNewUrlParser: true,
    // socketTimeoutMS: 5000, // COMBAK: when use replicaSet and primary was stopped
    readPreference: 'SECONDARY_PREFERRED',
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: context(client),
  });

  const app = express();
  server.applyMiddleware({
    app,
    options: {
      path: config.get('path'),
    },
  });

  const port = config.get('port');
  app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}).catch((err) => {
  console.error(err);
  process.error(1);
});
