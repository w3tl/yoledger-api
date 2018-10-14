jest.mock('mongodb');
jest.mock('jsonwebtoken');

import { Query, Mutation, User } from '../resolver';
import { User as UserModel } from '../../../model';

const userId = 'admin';

describe('user resolver', () => {
  const { connection } = require('mongodb');
  const models = { userModel: new UserModel(connection.db(), userId) };
  test('Query', async () => {
    const result = await Query.user(null, {}, { models });
    expect(result).toMatchSnapshot();
  });

  test('User', () => {
    expect(User.username({ _id: userId })).toBe(userId);
  });

  describe('Mutation', () => {
    test('signin should return token for correct credentials', async () => {
      const context = { models, secret: 'secret', expiresIn: 10 };
      const result = await Mutation.signin(null, { login: userId, password: 'password' }, context);
      expect(result).toMatchSnapshot();
    });

    describe('changePassword', () => {
      test('should throw an error when password are used', async () => {
        const context = {
          models: { userModel: new UserModel(connection.db(), 'user1') },
          secret: 'secret',
          expiresIn: 10,
          userId: 'user1',
        };
        await expect(Mutation.changePassword(null, { oldPassword: 'password', newPassword: 'passwordUsed' }, context))
          .rejects
          .toThrowError(/Password already used/);
      });

      test('should return token when when password was changed', async () => {
        const context = {
          models, secret: 'secret', expiresIn: 10, userId: 'admin',
        };
        const result = await Mutation.changePassword(null, { oldPassword: 'password', newPassword: 'newPassword' }, context);
        expect(result).toMatchSnapshot();
      });
    });
  });
});
