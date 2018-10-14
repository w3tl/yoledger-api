jest.mock('mongodb');

import { Query, Mutation, Transaction } from '../resolver';
import { Transaction as TransactionModel } from '../../../model';

describe('transaction resolver', () => {
  const { connection } = require('mongodb');
  const models = { transactionModel: new TransactionModel(connection.db(), 'admin') };

  test('Query', async () => {
    const result = await Query.transactions(null, {
      dateStart: '2018-06-20',
      page: 0,
      itemsPerPage: 1,
    }, { models });
    expect(result).toMatchSnapshot();
  });

  test('Transaction', () => {
    const dataloaders = {
      accountByName: {
        load: jest.fn(),
      },
    };
    Transaction.source({ source: { name: 'asset' } }, null, { dataloaders, userId: 'admin' });
    expect(dataloaders.accountByName.load.mock.calls[0]).toMatchSnapshot('source dataloader call');
    Transaction.destination({ destination: { name: 'expense' } }, null, { dataloaders, userId: 'admin' });
    expect(dataloaders.accountByName.load.mock.calls[1]).toMatchSnapshot('destination dataloader call');
  });

  describe('Mutation', () => {
    test('addTransaction', async () => {
      const result = await Mutation.addTransaction(null, {
        input: {
          source: 'Bank card',
          destination: 'Food',
          amount: 564,
          date: '2018-05-13',
        },
      }, { models, connection });
      expect(result.transaction).toMatchSnapshot();
    });

    test('deleteTransaction', async () => {
      const result = await Mutation.deleteTransaction(null, { id: '1' }, { models, connection });
      expect(result.success).toBeTruthy();
    });

    test('updateTransaction', async () => {
      const result = await Mutation.updateTransaction(null, {
        id: '1',
        input: {
          amount: 104,
          source: 'Cash',
          date: '2008-10-13',
        },
      }, { models, connection });
      expect(result.transaction).toMatchSnapshot();
    });
  });
});
