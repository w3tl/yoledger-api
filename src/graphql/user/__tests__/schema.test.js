jest.mock('mongodb');

import { graphql } from 'graphql';
import schema from '../../index';
import { User } from '../../../model';

const userId = 'admin';

describe('user schema', () => {
  const { connection } = require('mongodb');
  const models = { userModel: new User(connection.db(), userId) };
  test('should be return user by context', async () => {
    const query = `
    query user {
      user {
         username
      }
    }
    `;
    const rootValue = {};
    const context = { models };
    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);
    expect(result.errors).toBeUndefined();
    const { data } = result;

    expect(data).toMatchSnapshot(userId);
  });
});
