jest.mock('mongodb');

import { dataloaders } from '../../index';
import {
  Query, Mutation, Budgets,
} from '../resolver';
import { Account, Budget as BudgetModel } from '../../../model';

describe('budget resolver', () => {
  const { connection } = require('mongodb');
  const context = {
    dataloaders: dataloaders(connection),
    models: {
      budgetModel: new BudgetModel(connection.db(), 'admin'),
      accountModel: new Account(connection.db(), 'admin'),
    },
    userId: 'admin',
  };

  describe('Query', () => {
    test('bugdets should return accounts', async () => {
      const result = await Query.budgets(null, {
        dateStart: new Date('2018-05-10'),
        dateEnd: new Date('2018-06-25'),
      }, context);
      expect(result).toMatchSnapshot();
    });

    test('budget.account should return an account', async () => {
      const result = await Query.budget(null, { account: { name: 'Food' } }, context);
      expect(result).toMatchSnapshot();
    });
  });

  describe('Mutation', () => {
    test('upsertBudget', async () => {
      const result = await Mutation.upsertBudget(null, {
        input: {
          account: 'Food',
          date: new Date('2018-05-10'),
          amount: 564,
        },
      }, context);
      expect(result).toMatchSnapshot();
    });
  });
});
