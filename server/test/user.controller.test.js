const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../helper/jwt', () => ({
  signToken: jest.fn(() => 'token'),
}));

jest.mock('../helper/mailer', () => ({ sendMail: jest.fn().mockResolvedValue(null) }));

const { User } = require('../models');
const Controller = require('../controllers/userController');

function ctx({ body = {}, params = {}, user = { id: 1, role: 'student' } } = {}) {
  const req = httpMocks.createRequest({ method: 'POST', body, params });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController', () => {
  afterEach(() => jest.clearAllMocks());

  test('register success', async () => {
    User.create.mockResolvedValue({ id: 1, email: 'a@a.com' });
    const { req, res, next } = ctx({ body: { email: 'a@a.com', password: '123456' } });
    await Controller.register(req, res, next);
    expect(res.statusCode).toBe(201);
  });

  test('login invalid -> Unauthorized', async () => {
    User.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ body: { email: 'x@a.com', password: 'wrong' } });
    await Controller.login(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Unauthorized' }));
  });

  test('login success', async () => {
    User.findOne.mockResolvedValue({ id: 10, email: 'a@a.com', fullName: 'A', role: 'student', profilePicture: null, checkPassword: () => true });
    const { req, res } = ctx({ body: { email: 'a@a.com', password: '123456' } });
    await Controller.login(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data.token).toBeDefined();
  });

  test('updateProfile invalid birthDate -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: { birthDate: '12/31/2024' } });
    await Controller.updateProfile(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('verifyEmail success', async () => {
    const token = 'tok';
    const spy = jest.spyOn(Controller, 'verifyActionToken').mockReturnValue({ sub: 1, type: 'verify' });
    const user = { id: 1, isVerified: false, save: jest.fn() };
    User.findByPk.mockResolvedValue(user);
    const { req, res } = ctx({ body: { token } });
    await Controller.verifyEmail(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
    spy.mockRestore();
  });

  test('requestEmailVerification already verified -> 200', async () => {
    User.findByPk.mockResolvedValue({ id: 1, email: 'a@a.com', fullName: 'A', isVerified: true });
    const { req, res } = ctx();
    await Controller.requestEmailVerification(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });
});
