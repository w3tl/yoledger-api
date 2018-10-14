const NodeEnvironment = require('jest-environment-node');
const { MongoClient } = require('mongodb');
const config = require('../config');
const accounts = require('../mocks/accounts');
const transactions = require('./transaction/transactions');
const budgets = require('../mocks/budgets');

function randomDbname() { // from https://gist.github.com/6174/6062387
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const addUserId = userId => doc => ({ ...doc, userId });
const addAdmin = addUserId('admin');
const addDate = ({ date, ...doc }) => ({ ...doc, date: new Date(date) });
const addCreatedAt = ({ date, ...doc }) => ({ ...doc, createdAt: new Date(date) });

class GraphQLEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    this.global.__MONGO_URI__ = config.get('mongoUri').replace('{0}', randomDbname);
    const client = await MongoClient.connect(this.global.__MONGO_URI__, {
      connectWithNoPrimary: true,
      useNewUrlParser: true,
    });
    const db = client.db();
    await db.collection('accounts').insertMany(accounts.map(addAdmin));
    await db.collection('transactions').insertMany(transactions.map(addAdmin).map(addCreatedAt));
    await db.collection('budget').insertMany(budgets.map(addAdmin).map(addDate));
    await client.close();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = GraphQLEnvironment;
