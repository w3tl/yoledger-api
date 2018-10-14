import { AuthenticationError, UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

const createToken = (userId, secret, expiresIn) => jwt.sign({
  userId,
}, secret, {
  expiresIn,
});

export const User = {
  username: ({ _id }) => _id.toString(),
};

export const Query = {
  user(root, _, { models: { userModel } }) {
    return userModel.findOne();
  },
};

export const Mutation = {
  async signin(root, { login, password }, { models: { userModel }, secret, expiresIn }) {
    let isValid = false;
    try {
      isValid = await userModel.validatePassword(login, password);
    } catch (e) {
      throw new UserInputError('No user found with this login credentials.');
    }

    if (!isValid) {
      throw new AuthenticationError('Invalid password.');
    }

    return {
      token: createToken(login, secret, expiresIn),
    };
  },
  async signout(root, variables, { models: { userModel } }) {
    const user = await userModel.findOne();
    if (!user) {
      throw new UserInputError('No user found with this login');
    }
    return { success: true };
  },
  async changePassword(root, input, {
    models: { userModel }, userId, secret, expiresIn,
  }) {
    const { oldPassword, newPassword } = input;
    let isValid = false;
    try {
      isValid = await userModel.validatePassword(userId, oldPassword);
    } catch (e) {
      throw new UserInputError('No user found with this login credentials.');
    }

    if (!isValid) {
      throw new AuthenticationError('Invalid password.');
    }

    const result = await userModel.changePassword(newPassword);
    if (!result) {
      throw new UserInputError('Password already used');
    }

    return {
      token: createToken(userId, secret, expiresIn),
    };
  },
};
