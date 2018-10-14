jest.mock('crypto');
jest.mock('argon2');

const RealDate = Date;
function mockDate(isoDate) {
  global.Date = class extends RealDate {
    constructor() {
      super();
      return new RealDate(isoDate);
    }
  };
}

const { createCredentials } = require('./auth');

describe('auth', () => {
  beforeAll(() => {
    mockDate('2018-06-20');
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  test('createCredentials', async () => {
    const result = await createCredentials({ password: 'password' });
    expect(result).toMatchSnapshot();
  });

  describe('validateCreadentials', () => {
    const { validateCreadentials } = require('./auth');

    test('should throw error when credentials are not valid', () => {
      const creds = { valid: false };
      expect(validateCreadentials(creds))
        .rejects
        .toThrowError(/Invalid credentials/);
    });

    test('should throw error when use incorrect algorithm', async () => {
      const creds = { type: 'WrongAlgorithmType', valid: true };
      expect(validateCreadentials(creds))
        .rejects
        .toThrowError(/Wrong algorithm type/);
    });

    test('should use argon2 algorithm right', () => {
      const creds = {
        type: 'argon2',
        valid: true,
        hash: '12345678901234567890123456789012password',
        salt: '12345678901234567890123456789012',
      };
      expect(validateCreadentials(creds, 'password')).toBeTruthy();
    });
  });
});
