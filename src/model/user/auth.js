import crypto from 'crypto';
import argon2 from 'argon2';
import config from '../../config';

export class AuthError extends Error {
  constructor(message = 'Authentification error', ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
    this.code = 401;
    this.message = message;
  }
}

const preHash = (salt, password) => `${salt}${password}`;

export const createCredentials = async ({ password }) => {
  let salt; let hash;
  const algorithm = config.get('credentials.algorithm');

  switch (algorithm) {
    case 'dev': { // develop
      salt = crypto.randomBytes(8).toString('hex');
      hash = preHash(salt, password);
      break;
    } // NOTE: Each encryption algorithm must be added in the branch
    case 'argon2':
    default: {
      salt = crypto.randomBytes(32).toString('hex');
      const toHash = preHash(salt, password);
      hash = await argon2.hash(toHash);
    }
  }

  return {
    algorithm,
    createdAt: new Date(),
    salt,
    hash,
    valid: true, // COMBAK: use for account confirmation
  };
};

export const validateCreadentials = async ({
  algorithm, valid, salt, hash,
}, password) => {
  if (!valid) {
    throw new AuthError('Invalid credentials');
  }
  switch (algorithm) {
    case 'dev': // develop
      return preHash(salt, password) === hash;
    case 'argon2': {
      const toHash = preHash(salt, password);
      try {
        const result = await argon2.verify(hash, toHash);
        return result;
      } catch ({ message }) {
        throw new AuthError(message);
      }
    }
    default:
      throw new AuthError('Wrong algorithm type');
  }
};
