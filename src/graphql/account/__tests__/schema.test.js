jest.mock('mongodb');

import { graphql } from 'graphql';
import schema from '../../index';
import { Account } from '../../../model';

describe('account schema', () => {
  const { connection } = require('mongodb');
  const accountModel = new Account(connection.db(), 'admin');

  it('Should be return accounts', async () => {
    const query = `
    query accounts($type: AccountType!) {
      accounts(type: $type) {
         name
         balance
      }
    }
    `;

    const rootValue = {};
    const context = { models: { accountModel } };
    const variables = {
      type: 'ASSET',
    };

    const result = await graphql(schema, query, rootValue, context, variables);
    const { data } = result;

    expect(data.accounts).toMatchSnapshot('query ASSET accounts');
  });
});
