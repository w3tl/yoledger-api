const jwt = jest.genMockFromModule('jsonwebtoken');

jwt.sign = (props, secret, opts) => `${JSON.stringify(props)};${secret};${JSON.stringify(opts)}`;

module.exports = jwt;
