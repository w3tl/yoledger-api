jest.mock('mongodb');
import dataloaders from '../dataloaders';

describe('dataloaders', () => {
  const { connection } = require('mongodb');
  const dl = dataloaders(connection);

  test('accountByName', async () => {
    const load = await dl.accountByName.load({ name: 'Food', type: 'EXPENSE', userId: 'admin' });
    expect(load).toMatchSnapshot('Load Food for admin');

    const loadMany = await dl.accountByName.loadMany([
      { name: 'Food', type: 'EXPENSE', userId: 'admin' },
      { name: 'Train', type: 'EXPENSE', userId: 'admin' },
    ]);
    expect(loadMany).toMatchSnapshot('Load Food and Train for admin');
  });
});
