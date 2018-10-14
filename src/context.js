import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';
import { dataloaders, models } from './graphql';
import config from './config';

export const getUser = async (req) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      return await jwt.verify(token, config.get('token.secret'));
    } catch (e) {
      throw new AuthenticationError('Your session expired');
    }
  }
  return { userId: 'demo' };
};

export default client => async ({ req }) => {
  const { userId } = await getUser(req);
  const allModels = models(client, userId);
  return {
    dataloaders: dataloaders(client),
    connection: client,
    secret: config.get('token.secret'),
    expiresIn: config.get('token.expiresIn'),
    models: allModels,
    userId,
  };
};
