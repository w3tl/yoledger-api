const convict = require('convict');

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test', 'stage'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3030,
    env: 'GRAPHQL_PORT',
    arg: 'port',
  },
  path: {
    doc: 'Custom path',
    env: 'GRAPHQL_PATH',
    default: 'graphql',
  },
  credentials: {
    algorithm: {
      doc: 'Current crypt algorithm',
      env: 'CRED_ALG',
      default: 'default',
    },
  },
  token: {
    secret: {
      doc: 'Secret used for jwt tokens',
      format: '*',
      default: '',
      sensitive: true,
      env: 'JWT_SECRET',
    },
    expiresIn: {
      doc: 'Expressed in seconds describing a time span',
      format: 'int',
      default: 60, // 1m
      env: 'TOKEN_EXPIRES',
    },
  },
  mongoUri: {
    doc: 'MongoDB connection string',
    format: '*',
    default: 'mongodb://localhost',
    env: 'MONGO_URI',
  },
});

// Load environment dependent configuration
const env = config.get('env');
config.loadFile(`config/${env}.json`);
// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;
