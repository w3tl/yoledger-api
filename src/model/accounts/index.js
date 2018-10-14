import Model from '../Model';

export const accountTypes = ['ASSET', 'EXPENSE', 'INCOME', 'VENDOR'];

const schema = {
  type: 'object',
  required: ['name', 'type', 'userId'],
  additionalProperties: false,
  properties: {
    _id: {
      bsonType: 'objectId',
    },
    name: {
      type: 'string',
    },
    balance: {
      type: 'number',
    },
    type: {
      enum: accountTypes,
    },
    userId: {
      type: 'string',
    },
  },
};

export default class Account extends Model {
  constructor(db, userId) {
    super(db, userId);
    this.schema = schema;
    this.collName = 'accounts';
  }

  create({
    name, type, balance = 0,
  }) {
    return super.insertOne({
      name,
      type,
      balance,
    });
  }

  addAmount(name, amount, session) {
    return super.updateOne(
      { name, userId: this.userId },
      { $inc: { balance: amount } },
      { session },
    );
  }

  findByName(name, ...props) {
    return super.findOne({ name }, ...props);
  }
}
