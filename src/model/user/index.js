import Model from '../Model';
import schema from './schema';
import { createCredentials, validateCreadentials } from './auth';

export default class User extends Model {
  constructor(db, userId) {
    super(db, userId.toLowerCase());
    this.schema = schema;
    this.collName = 'users';
  }

  async create({ password }) {
    if (await this.findOne()) {
      throw new Error('User exist');
    }

    const credentials = await createCredentials({ password });

    const user = {
      _id: this.userId,
      credentials: {
        current: credentials,
        store: [],
      },
      createdAt: new Date(),
    };

    await super.insertOne(user);
    return this.findOne();
  }

  findOne(...props) {
    return this.collection.findOne({ _id: this.userId }, ...props);
  }

  async validatePassword(login, password) {
    const user = await this.collection.findOne({ _id: login });
    if (!user) {
      throw new Error('User not found');
    }
    try {
      const result = await validateCreadentials(user.credentials.current, password);
      return result;
    } catch (e) {
      // NOTE: log error message to read error
      return false;
    }
  }

  async changePassword(password) {
    const user = await this.findOne();
    const validationPromises = user.credentials.store.map(c => validateCreadentials(c, password));
    const results = await Promise.all(validationPromises);
    const matchedPassword = results.find(e => e);
    if (matchedPassword) {
      return false;
    }
    const oldCredentials = {
      ...user.credentials.current,
      valid: true,
    };
    const credentials = await createCredentials({ password });
    const { result } = await this.updateOne({}, {
      $set: {
        'credentials.current': credentials,
      },
      $push: {
        'credentials.store': oldCredentials,
      },
    });
    return result.nModified === 1;
  }
}
