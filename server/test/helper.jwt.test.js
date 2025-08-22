describe('helper/jwt', () => {
  test('sign and verify roundtrip', () => {
    jest.resetModules();
    process.env.JWT_SECRET = 's';
    const { signToken, verifyToken } = require('../helper/jwt');
    const token = signToken({ id: 1 });
    const payload = verifyToken(token);
    expect(payload.id).toBe(1);
  });
});
