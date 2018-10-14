jest.mock('./auth');
const auth = require('./auth');

auth.createCredentials.mockReturnValue({
  algorithm: 'very strong algorithm',
  createdAt: new Date('2018-06-20'),
  salt: 'random last',
  hash: 'crypto hash',
  valid: true,
});

import { MongoClient } from 'mongodb';
import config from '../../config';
import User from './index';

const RealDate = Date;
function mockDate(isoDate) {
  global.Date = class extends RealDate {
    constructor() {
      super();
      return new RealDate(isoDate);
    }
  };
}

let connection;
let db;

describe('user', () => {
  beforeAll(async () => {
    mockDate('2018-06-20');
    connection = await MongoClient.connect(config.get('mongoUri'), {
      connectWithNoPrimary: true,
      useNewUrlParser: true,
    });
    db = connection.db('dbusers');
    const userModel = new User(db, 'dumb');
    await userModel.init();
  });

  afterAll(async () => {
    global.Date = RealDate;
    await connection.close();
  });

  test('create new user', async () => {
    const userModel = new User(db, 'admin');
    const user = await userModel.create({ password: 'password' });
    expect(user).toMatchSnapshot();
  });

  describe('validatePassword', () => {
    beforeAll(async () => {
      const userModel = new User(db, 'dumb');
      await userModel.clear();
      await userModel.create({ password: 'password' });
    });

    test('should throw error when user not found', async () => {
      const userModel = new User(db, 'wronUser');
      expect(userModel.validatePassword('wronUser'))
        .rejects
        .toThrowError(/User not found/);
    });

    test('should return false when validateCreadentials throw error', async () => {
      auth.validateCreadentials.mockImplementation(() => {
        throw new Error();
      });
      const userModel = new User(db, 'dumb');
      const result = await userModel.validatePassword('dumb', 'passwd');
      expect(result).toBeFalsy();
    });

    test('should return true when password valid', async () => {
      auth.validateCreadentials.mockReturnValue(true);
      const userModel = new User(db, 'dumb');
      expect(userModel.validatePassword('dumb', 'password')).toBeTruthy();
    });
  });

  describe('changePassword', () => {
    it('should return false when password already used', async () => {
      const userModel = new User(db, 'dumb1');
      await userModel.insertOne({
        _id: 'dumb1',
        credentials: {
          current: {
            algorithm: 'very strong algorithm',
            createdAt: new Date('2018-06-20'),
            salt: 'random salt',
            hash: 'hash to archive',
            valid: true,
          },
          store: [{
            algorithm: 'very strong algorithm',
            createdAt: new Date('2018-06-20'),
            salt: 'random salt',
            hash: 'old crypto hash',
            valid: true,
          }],
        },
        createdAt: new Date('2018-06-20'),
      });
      auth.validateCreadentials.mockReturnValue(Promise.resolve(true));
      const result = await userModel.changePassword('password');
      expect(result).toBeFalsy();
    });

    it('should return true when password are new and update cred\'s store', async () => {
      const userModel = new User(db, 'dumb2');
      await userModel.insertOne({
        _id: 'dumb2',
        credentials: {
          current: {
            algorithm: 'very strong algorithm',
            createdAt: new Date('2018-06-20'),
            salt: 'random salt',
            hash: 'hash to archive',
            valid: true,
          },
          store: [{
            algorithm: 'very strong algorithm',
            createdAt: new Date('2018-06-20'),
            salt: 'random salt',
            hash: 'old crypto hash',
            valid: true,
          }],
        },
        createdAt: new Date('2018-06-20'),
      });
      auth.validateCreadentials.mockReturnValue(Promise.resolve(false));
      const result = await userModel.changePassword('password');
      expect(result).toBeTruthy();
      const user = await userModel.findOne();
      expect(user).toMatchSnapshot();
    });
  });
});
