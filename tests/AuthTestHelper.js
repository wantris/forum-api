/* istanbul ignore file */
const Jwt = require('@hapi/jwt');

const AuthTestHelper = {
  async getAccessToken() {
    const userPayload = {
      id: 'user-123',
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'abc',
    };
    const accessToken = Jwt.token.generate(
      userPayload,
      process.env.ACCESS_TOKEN_KEY,
    );

    return accessToken;
  },
};

module.exports = AuthTestHelper;
