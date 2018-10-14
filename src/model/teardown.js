module.exports = async function teardown() {
  await global.__MONGOD__.stop();
};
