import { MongoClient, ObjectId } from 'mongodb';
import config from '../../config';
import Account from './index';
import accounts from '../../../mocks/accounts';

let db;
let connection;
let Accounts;

const account = accounts[0];

beforeAll(async () => {
  connection = await MongoClient.connect(config.get('mongoUri'), {
    connectWithNoPrimary: true,
    useNewUrlParser: true,
  });
  db = connection.db('dbaccounts');
  Accounts = new Account(db, 'user1');
  await Accounts.init();
  await Accounts.clear();
  await Accounts.create(account);
});

afterAll(async () => {
  await connection.close();
});

describe('accounts', () => {
  test('schema', async () => {
    const accountDoc = await Accounts.findByName(account.name);
    expect(accountDoc).toMatchSnapshot({
      _id: expect.any(ObjectId),
    });

    account.type = 'blabla';
    await expect(Accounts.create(account))
      .rejects
      .toThrow(/Document failed validation/);
  });

  test('wrong user id', async () => {
    expect.assertions(1);
    await expect(new Account(db, 'userBlaId').findByName(account.name))
      .resolves
      .toBeNull();
  });

  test('addAmount', async () => {
    let accountDoc = await Accounts.findByName(account.name);
    await Accounts.addAmount(account.name, -10);
    const accountDocAfter = await Accounts.findByName(account.name);
    expect(accountDocAfter.balance).toEqual(accountDoc.balance - 10);
    await Accounts.addAmount(account.name, 25);
    accountDoc = await Accounts.findByName(account.name);
    expect(accountDoc.balance).toEqual(accountDocAfter.balance + 25);
  });
});
