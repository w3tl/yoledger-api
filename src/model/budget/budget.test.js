import { MongoClient, ObjectId } from 'mongodb';
import config from '../../config';
import Budget from './index';
import Account from '../accounts';
import budgets from '../../../mocks/budgets';
import accounts from '../../../mocks/accounts';

let db;
let connection;
let budgetModel;

beforeAll(async () => {
  connection = await MongoClient.connect(config.get('mongoUri'), {
    connectWithNoPrimary: true,
    useNewUrlParser: true,
  });
  db = connection.db('dbbudgets');
  budgetModel = new Budget(db, 'admin');
  await budgetModel.init();
  const accountModel = new Account(db, 'admin');
  await accountModel.init();
  accountModel.insertMany(accounts);
});

afterAll(async () => {
  await connection.close();
});

describe('budget', () => {
  describe('upsertBudget', () => {
    beforeAll(async () => {
      await budgetModel.clear();
      await budgetModel
        .insertMany(
          budgets.map(({ date, ...other }) => ({ date: new Date(date), ...other })),
        );
    });

    afterAll(async () => {
      await budgetModel.clear();
      await budgetModel
        .insertMany(
          budgets.map(({ date, ...other }) => ({ date: new Date(date), ...other })),
        );
    });

    test('should update the amount in the existing period', async () => {
      const { date, account } = budgets[0];
      await budgetModel.upsertBudget({
        account: account.name,
        date,
        amount: 14,
      });
      const doc = await budgetModel.findOne({ date: new Date(date) });
      expect(doc).toMatchSnapshot({
        _id: expect.any(ObjectId),
      }, `should contain "${account}" account with amount of 14`);
    });

    test('should add a budget to the existing period', async () => {
      const { date } = budgets[0];
      await budgetModel.upsertBudget({
        account: 'Food',
        date,
        amount: 15,
      });
      const doc = await budgetModel.findOne({ date: new Date(date) });
      expect(doc).toMatchSnapshot({
        _id: expect.any(ObjectId),
      }, 'should contain "twix" account with amount of 15');
    });

    test('should create a non-existent period with a budget', async () => {
      const date = new Date('2018-01-13');
      await budgetModel.upsertBudget({
        account: 'Train',
        date,
        amount: 15,
      });
      const doc = await budgetModel.findOne({ date });
      expect(doc).toMatchSnapshot({
        _id: expect.any(ObjectId),
      }, 'should contain "twix" account with amount of 15');
    });
  });
});
