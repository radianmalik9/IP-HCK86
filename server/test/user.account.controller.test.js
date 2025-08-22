const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  User: { findByPk: jest.fn() },
}));

const { User } = require('../models');
const Controller = require('../controllers/userController');

function ctx({ method = 'DELETE', params = {}, user = { id: 1, role: 'student' } } = {}) {
  const req = httpMocks.createRequest({ method, params });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController deleteAccount', () => {
  afterEach(() => jest.clearAllMocks());

  test('deleteAccount - success', async () => {
    const user = { id: 1, destroy: jest.fn() };
    User.findByPk.mockResolvedValue(user);
    const { req, res } = ctx();
    await Controller.deleteAccount(req, res, jest.fn());
    expect(user.destroy).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test('deleteAccount - not found -> NotFound', async () => {
    User.findByPk.mockResolvedValue(null);
    const { req, res, next } = ctx();
    await Controller.deleteAccount(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });
});
