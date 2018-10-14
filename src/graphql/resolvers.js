import {
  Query as UserQuery,
  Mutation as UserMutation,
  User,
} from './user';
import {
  Query as AccountQuery,
  Mutation as AccountMutation,
  Account,
} from './account';
import {
  Query as TransactionQuery,
  Mutation as TransactionMutation,
  Transaction,
} from './transaction';
import {
  Query as BudgetQuery,
  Mutation as BudgetMutation,
  Budget,
} from './budget';
import dateResolver from './date';

const Mutation = Object.assign(
  {}, UserMutation, AccountMutation, TransactionMutation, BudgetMutation,
);

export default {
  Query: Object.assign({}, UserQuery, AccountQuery, TransactionQuery, BudgetQuery),
  Mutation,
  User,
  Account,
  Transaction,
  Budget,
  Date: dateResolver,
};
