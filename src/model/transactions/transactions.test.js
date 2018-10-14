import { MongoClient, ObjectId } from 'mongodb';
import config from '../../config';
import Transaction from './index';
import Account from '../accounts';
import accounts from '../../../mocks/accounts';
import transactions from '../../../mocks/transactions';

let db;
let connection;
let Trans;
let Accounts;
let transDoc;

const transObj = transactions[0];
const expenseAccount = accounts.find(({ name }) => name === transObj.destination);
const assetAccount = accounts.find(({ name }) => name === transObj.source);

beforeAll(async () => {
  connection = await MongoClient.connect(config.get('mongoUri'), {
    connectWithNoPrimary: true,
    useNewUrlParser: true,
  });
  db = connection.db('dbtransactions');
  Trans = new Transaction(db, 'user1');
  Accounts = new Account(db, 'user1');
  await Accounts.init();
  await Trans.init();
});

afterAll(async () => {
  await connection.close();
});

describe('transaction', () => {
  beforeEach(async () => {
    await Accounts.clear();
    await Trans.clear();
    await Accounts.create(expenseAccount);
    await Accounts.create(assetAccount);
    let _id;
    await connection.withSession(async (session) => {
      _id = await Trans.post(transObj, session);
      transDoc = await Trans.findOne({ _id });
    });
  });

  test('post should create transaction and update the balance of accounts', async () => {
    expect(transDoc).toMatchSnapshot({
      _id: expect.any(ObjectId),
      createdAt: expect.any(Date),
    }, 'Transaction');
    const source = await Accounts.findByName(assetAccount.name);
    expect(source).toMatchSnapshot({
      _id: expect.any(ObjectId),
    }, 'Source account');
    const destination = await Accounts.findByName(expenseAccount.name);
    expect(destination).toMatchSnapshot({
      _id: expect.any(ObjectId),
    }, 'Destination account');
  });

  test('an incorrect account should cause an exception when posting', async () => {
    const transObjToTest = transactions[1];
    expect.assertions(2);
    await expect(connection.withSession(s => Trans.post({ ...transObjToTest, ...{ source: 'bla' } }, s)))
      .rejects
      .toThrowError(/Account .* not found/);

    await expect(connection.withSession(s => Trans.post({ ...transObjToTest, ...{ destination: 'bla' } }, s)))
      .rejects
      .toThrowError(/Account .* not found/);
  });

  test('unpost should cancel transaction', async () => {
    const destinationBefore = await Accounts.findByName(expenseAccount.name);
    const sourceBefore = await Accounts.findByName(assetAccount.name);
    await connection.withSession(session => Trans.unpost(transDoc._id, session));
    const destinationAfter = await Accounts.findByName(expenseAccount.name);
    const sourceAfter = await Accounts.findByName(assetAccount.name);

    expect(sourceAfter.balance).toEqual(sourceBefore.balance + transDoc.amount);
    expect(destinationAfter.balance).toEqual(destinationBefore.balance - transDoc.amount);
  });

  test('when updating accounts, a new transaction must be created', async () => {
    const newSource = { name: 'check', type: 'ASSET', balance: 0 };
    await Accounts.create(newSource);

    let updatedId;
    await connection.withSession(async (session) => {
      updatedId = await Trans.update(transDoc._id, {
        source: newSource.name, amount: 100,
      }, session);
    });
    expect(transDoc._id).not.toEqual(updatedId);
    const destAcc = await Accounts.findByName(expenseAccount.name);
    const sourceAcc = await Accounts.findByName(assetAccount.name);
    const newSourceAcc = await Accounts.findByName(newSource.name);

    expect(sourceAcc.balance).toEqual(assetAccount.balance);
    expect(destAcc.balance).toEqual(100);
    expect(newSourceAcc.balance).toEqual(-100);
  });

  test('an incorrect transaction id should cause an exception when updating or unposting', async () => {
    expect.assertions(2);
    await expect(connection.withSession(s => Trans.unpost('wrongId', s)))
      .rejects
      .toThrowError('Transaction not found');

    await expect(connection.withSession(s => Trans.update('wrongId', {}, s)))
      .rejects
      .toThrowError('Transaction not found');
  });

  test('when updating only createdAt fields, the transaction should only update it', async () => {
    let updatedId;
    await connection.withSession(async (session) => {
      updatedId = await Trans.update(transDoc._id, { createdAt: new Date() }, session);
    });
    expect(transDoc._id).toEqual(updatedId);
  });

  test('nothing to update', async () => {
    await expect(Trans.update(transDoc._id, {}))
      .resolves
      .toBeNull();
  });
});
