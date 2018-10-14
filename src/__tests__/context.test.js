import { getUser } from '../context';

describe('context', () => {
  describe('getUser', () => {
    it('should return userId for correct token', async () => {
      const request = {
        headers: {
          authorization: '"{"userId":"admin"}";jwtsecret',
        },
      };
      const result = await getUser(request);
      expect(result).toMatchSnapshot();
    });

    it('should throw an error when token are wrong', async () => {
      const request = {
        headers: {
          authorization: '"{"userId":"admin"}";jwtnotsecret',
        },
      };
      await expect(getUser(request))
        .rejects
        .toThrowError(/Your session expired/);
    });

    it('should return demo user when no token', async () => {
      const request = {
        headers: {},
      };
      const result = await getUser(request);
      expect(result).toMatchSnapshot();
    });
  });
});
