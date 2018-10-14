const jwt = jest.genMockFromModule('jsonwebtoken');

jwt.verify = (token, secret) => {
  const [props, tokenSecret] = token.split(';');
  if (tokenSecret !== secret) throw new Error();
  return Promise.resolve(JSON.parse(props));
};

module.exports = jwt;
