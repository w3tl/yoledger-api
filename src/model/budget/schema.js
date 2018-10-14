import { accountTypes } from '../accounts';

export default {
  type: 'object',
  required: ['date', 'userId'],
  additionalProperties: false,
  properties: {
    _id: {
      bsonType: 'objectId',
    },
    date: {
      bsonType: 'date',
    },
    account: {
      type: 'object',
      required: ['name', 'type'],
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
        },
        type: {
          enum: accountTypes,
        },
      },
    },
    amount: {
      type: 'number',
    },
    balance: {
      type: 'number',
    },
    userId: {
      type: 'string',
    },
  },
};
