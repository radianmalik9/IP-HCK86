const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../helper/mailer', () => ({ sendMail: jest.fn().mockResolvedValue(null) }));

jest.mock('firebase-admin', () => ({ apps: [] }));

const { User } = require('../models');
const Controller = require('../controllers/userController');

function ctx({ method = 'POST', body = {}, params = {}, user = { id: 1, role: 'student' } } = {}) {
  const req = httpMocks.createRequest({ method, body, params });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController additional negative branches', () => {
  afterEach(() => jest.clearAllMocks());

  test('login missing credentials -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: { email: '', password: '' } });
    await Controller.login(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('googleSignIn missing idToken -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: {} });
    await Controller.googleSignIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('googleSignIn admin not configured -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: { idToken: 'x' } });
    await Controller.googleSignIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('createUser missing fields -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: { email: '', password: '' }, user: { id: 1, role: 'admin' } });
    await Controller.createUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('createUser duplicate email -> BadRequest', async () => {
    User.findOne.mockResolvedValue({ id: 7, email: 'a@a.com' });
    const { req, res, next } = ctx({ body: { email: 'a@a.com', password: '123456', fullName: 'A' }, user: { id: 1, role: 'admin' } });
    await Controller.createUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('updateUser by admin with invalid role -> BadRequest', async () => {
    const { req, res, next } = ctx({ method: 'PUT', params: { id: '2' }, user: { id: 1, role: 'admin' }, body: { role: 'owner' } });
    await Controller.updateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('updateUser not found after update -> NotFound', async () => {
    User.update.mockResolvedValue([1]);
    User.findByPk.mockResolvedValue(null);
    const { req, res, next } = ctx({ method: 'PUT', params: { id: '2' }, user: { id: 2, role: 'student' }, body: { fullName: 'X' } });
    await Controller.updateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('deleteUser not found -> NotFound', async () => {
    User.findByPk.mockResolvedValue(null);
    const { req, res, next } = ctx({ method: 'DELETE', params: { id: '1' }, user: { id: '1', role: 'student' } });
    await Controller.deleteUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('requestEmailVerification when unverified -> sends email and 200', async () => {
    User.findByPk.mockResolvedValue({ id: 1, email: 'a@a.com', fullName: 'A', isVerified: false });
    const { req, res } = ctx({ method: 'GET', user: { id: 1, role: 'student' } });
    await Controller.requestEmailVerification(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });

  test('verifyEmail missing token -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: {} });
    await Controller.verifyEmail(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('verifyEmail invalid token type -> BadRequest', async () => {
    const spy = jest.spyOn(Controller, 'verifyActionToken').mockReturnValue({ sub: 1, type: 'reset' });
    const { req, res, next } = ctx({ body: { token: 'x' } });
    await Controller.verifyEmail(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
    spy.mockRestore();
  });
});
