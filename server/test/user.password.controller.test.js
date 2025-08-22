const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  User: { findOne: jest.fn(), findByPk: jest.fn() },
}));

jest.mock('../helper/mailer', () => ({ sendMail: jest.fn() }));

const { User } = require('../models');
const { sendMail } = require('../helper/mailer');
const Controller = require('../controllers/userController');

function ctx({ method = 'POST', body = {}, user = { id: 1, role: 'student' } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController password flows', () => {
  afterEach(() => jest.clearAllMocks());

  test('forgotPassword - missing email -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: {} });
    await Controller.forgotPassword(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('forgotPassword - user exists -> 200 and email sent', async () => {
    User.findOne.mockResolvedValue({ id: 2, email: 'a@a.com', fullName: 'A' });
    const { req, res } = ctx({ body: { email: 'a@a.com' } });
    await Controller.forgotPassword(req, res, jest.fn());
    expect(sendMail).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test('forgotPassword - user not exists -> 200 and no email', async () => {
    User.findOne.mockResolvedValue(null);
    const { req, res } = ctx({ body: { email: 'x@x.com' } });
    await Controller.forgotPassword(req, res, jest.fn());
    expect(sendMail).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test('resetPassword - missing fields -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: {} });
    await Controller.resetPassword(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('resetPassword - short password -> BadRequest', async () => {
    const { req, res, next } = ctx({ body: { token: 't', newPassword: '123' } });
    await Controller.resetPassword(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('resetPassword - token expired -> BadRequest', async () => {
    const spy = jest.spyOn(Controller, 'verifyActionToken').mockImplementation(() => { const e = new Error('expired'); e.name = 'TokenExpiredError'; throw e; });
    const { req, res, next } = ctx({ body: { token: 't', newPassword: '123456' } });
    await Controller.resetPassword(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
    spy.mockRestore();
  });

  test('resetPassword - success', async () => {
    const spy = jest.spyOn(Controller, 'verifyActionToken').mockReturnValue({ sub: 1, type: 'reset' });
    const user = { id: 1, save: jest.fn() };
    User.findByPk.mockResolvedValue(user);
    const { req, res } = ctx({ body: { token: 't', newPassword: '123456' } });
    await Controller.resetPassword(req, res, jest.fn());
    expect(user.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    spy.mockRestore();
  });
});
