import { accountTypes } from '../accounts';

export default {
  type: 'object',
  required: ['source', 'destination', 'amount', 'createdAt', 'userId'],
  additionalProperties: false,
  properties: {
    _id: {
      bsonType: 'objectId',
    },
    source: {
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
    destination: {
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
      type: 'number', // TODO: !== 0
    },
    userId: {
      type: 'string',
    },
    createdAt: {
      bsonType: 'date',
    },
  },
};
