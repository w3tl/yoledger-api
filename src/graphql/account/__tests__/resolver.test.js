jest.mock('mongodb');

import { Query, Mutation, Account } from '../resolver';
import { Account as AccountModel } from '../../../model';

describe('account resolver', () => {
  const { connection } = require('mongodb');
  const accountModel = new AccountModel(connection.db(), 'admin');

  test('Query', async () => {
    const result = await Query.accounts(null, { type: 'ASSET' }, { models: { accountModel } });
    expect(result).toMatchSnapshot('accounts');
  });

  test('Account', () => {
    expect(Account.id({ _id: '1' })).toBe('1');
  });

  describe('Mutation', () => {
    describe('addAccount', () => {
      test('addAccount', async () => {
        const result = await Mutation.addAccount(null, {
          input: { name: 'iTunes', type: 'EXPENSE' },
        }, { models: { accountModel } });
        expect(result).toMatchSnapshot();
      });

      test('should add account with same name and other type', async () => {
        const result = await Mutation.addAccount(null, {
          input: { name: 'Casg', type: 'ASSET' },
        }, { models: { accountModel } });
        expect(result).toMatchSnapshot();
      });

      test('should throw an error when add existing account with same type', async () => {
        await expect(Mutation.addAccount(null, {
          input: { name: 'Casg', type: 'ASSET' },
        }, { models: { accountModel } }))
          .rejects
          .toThrowError(/already exists/);
      });
    });
  });
});
