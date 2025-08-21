const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  User: { update: jest.fn(), findByPk: jest.fn() },
}));

const { User } = require('../models');
const Controller = require('../controllers/userController');

function ctx({ body = {}, user = { id: 1, role: 'student' } } = {}) {
  const req = httpMocks.createRequest({ method: 'PUT', body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController updateProfile birthDate branches', () => {
  afterEach(() => jest.clearAllMocks());

  test('empty birthDate coerces to null', async () => {
    User.findByPk.mockResolvedValue({ id: 1, email: 'a@a.com' });
    const { req, res } = ctx({ body: { birthDate: '' } });
    await Controller.updateProfile(req, res, jest.fn());
    expect(User.update).toHaveBeenCalledWith(expect.objectContaining({ birthDate: null }), expect.any(Object));
    expect(res.statusCode).toBe(200);
  });

  test('valid YYYY-MM-DD passes through', async () => {
    User.findByPk.mockResolvedValue({ id: 1, email: 'a@a.com' });
    const { req, res } = ctx({ body: { birthDate: '2024-12-31' } });
    await Controller.updateProfile(req, res, jest.fn());
    expect(User.update).toHaveBeenCalledWith(expect.objectContaining({ birthDate: '2024-12-31' }), expect.any(Object));
    expect(res.statusCode).toBe(200);
  });
});
