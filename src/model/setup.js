const { ReplSet } = require('mongodb-topology-manager');

module.exports = async function setup() {
  const replSet = new ReplSet('mongod', [{
    options: {
      bind_ip: 'localhost', port: 31000, dbpath: `${__dirname}/data/db/31000`,
    },
  }], {
    replSet: 'rs',
  });

  await replSet.purge();
  await replSet.start();

  global.__MONGOD__ = replSet;
};
