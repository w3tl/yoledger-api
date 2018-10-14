const Email = {
  bsonType: 'object',
  required: ['value'],
  additionalProperties: false,
  properties: {
    value: {
      type: 'string',
    },
  },
};

const Credentials = {
  bsonType: 'object',
  required: ['algorithm', 'salt', 'createdAt', 'hash', 'valid'],
  additionalProperties: false,
  properties: {
    algorithm: {
      type: 'string',
    },
    salt: {
      type: 'string',
    },
    createdAt: {
      bsonType: 'date',
    },
    hash: {
      type: 'string',
    },
    valid: {
      type: 'boolean',
    },
  },
};

export default {
  type: 'object',
  required: ['_id', 'credentials', 'createdAt'],
  // additionalProperties: false,
  properties: {
    _id: {
      type: 'string',
    },
    createdAt: {
      bsonType: 'date',
    },
    emails: {
      type: 'array',
      items: Email,
    },
    credentials: {
      type: 'object',
      required: ['current'],
      additionalProperties: false,
      properties: {
        current: Credentials,
        store: {
          type: 'array',
          items: Credentials,
        },
      },
    },
  },
};
