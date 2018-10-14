const crypto = jest.genMockFromModule('crypto');

const randomString = '12345678901234567890123456789012345678901234567890';

function randomBytes(number) {
  return {
    toString: () => randomString.substr(0, number),
  };
}

crypto.randomBytes = randomBytes;

module.exports = crypto;
