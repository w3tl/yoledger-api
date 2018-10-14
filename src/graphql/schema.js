import { Schema as userTypeDefs } from './user';
import { Schema as transactionTypeDefs } from './transaction';
import { Schema as accountTypeDefs } from './account';
import { Schema as budgetTypeDefs } from './budget';

export default `
type Query {
  dummy: Boolean
}
type Mutation {
  dummy: Boolean
}
scalar Date
${userTypeDefs}
${accountTypeDefs}
${transactionTypeDefs}
${budgetTypeDefs}
`;
