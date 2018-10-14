module.exports = {
  hash: value => Promise.resolve(value),
  verify: (value1, value2) => Promise.resolve(value1 === value2),
};
