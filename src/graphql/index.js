import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './schema';
import resolvers from './resolvers';
import dataloaders from './dataloaders';
import {
  User,
  Account,
  Transaction,
  Budget,
} from '../model';

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const models = (connection, userId) => ({
  userModel: new User(connection.db(), userId),
  accountModel: new Account(connection.db(), userId),
  transactionModel: new Transaction(connection.db(), userId),
  budgetModel: new Budget(connection.db(), userId),
});

export { dataloaders };
