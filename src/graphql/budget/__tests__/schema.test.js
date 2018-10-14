jest.mock('mongodb');

import { graphql } from 'graphql';
import schema, { dataloaders } from '../../index';
import { Budget } from '../../../model';

describe('budget schema', () => {
  const { connection } = require('mongodb');
  const budgetModel = new Budget(connection.db(), 'admin');
  const context = {
    dataloaders: dataloaders(connection),
    models: { budgetModel },
    userId: 'admin',
  };

  it('must return plan with periods and accounts', async () => {
    const query = `
    query budgets($dateStart: Date!, $dateEnd: Date!) {
      budgets(dateStart: $dateStart, dateEnd: $dateEnd) {
        accounts {
          id
          name
        }
      }
    }
    `;
    const rootValue = {};
    const variables = {
      dateStart: '2018-05-10',
      dateEnd: '2018-06-25',
    };

    const result = await graphql(schema, query, rootValue, context, variables);
    expect(result.errors).toBeUndefined();
    expect(result.data).toMatchSnapshot();
  });

  it('query budget must return budget for account', async () => {
    const query = `
    query budget($account: String!, $dateStart: Date!, $dateEnd: Date!) {
      budget(account: $account, dateStart: $dateStart, dateEnd: $dateEnd) {
        id
        date
        account {
          id
          name
        }
        amount
      }
    }
    `;
    const rootValue = {};
    const variables = {
      account: 'Food',
      dateStart: '2018-05-10',
      dateEnd: '2018-06-25',
    };

    const result = await graphql(schema, query, rootValue, context, variables);
    expect(result.errors).toBeUndefined();
    expect(result.data).toMatchSnapshot();
  });
});
