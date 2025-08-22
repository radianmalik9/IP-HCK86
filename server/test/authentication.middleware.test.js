const httpMocks = require('node-mocks-http');

jest.mock('../helper/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../models', () => ({
  User: { findByPk: jest.fn() },
}));

const { verifyToken } = require('../helper/jwt');
const { User } = require('../models');
const { authentication, authorization } = require('../middlewares/authentication');

describe('authentication middleware', () => {
  afterEach(() => jest.clearAllMocks());

  test('no Authorization header -> 401', async () => {
    const req = httpMocks.createRequest({ headers: {} });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authentication(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Unauthorized' }));
  });

  test('invalid token format -> 401', async () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authentication(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Unauthorized' }));
  });

  test('jwt error -> 401', async () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer abc' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    verifyToken.mockImplementation(() => { throw { name: 'JsonWebTokenError' }; });
    await authentication(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'JsonWebTokenError' }));
  });

  test('user not found -> 401', async () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer abc' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    verifyToken.mockReturnValue({ id: 123 });
    User.findByPk.mockResolvedValue(null);
    await authentication(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Unauthorized' }));
  });

  test('success attaches user and calls next', async () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer xyz' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    const user = { id: 1, role: 'student' };
    verifyToken.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(user);
    await authentication(req, res, next);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('authorization middleware', () => {
  test('forbidden when role not allowed', () => {
    const req = httpMocks.createRequest();
    req.user = { id: 1, role: 'student' };
    const res = httpMocks.createResponse();
    const next = jest.fn();
    authorization(['instructor'])(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Forbidden' }));
  });

  test('allowed passes through', () => {
    const req = httpMocks.createRequest();
    req.user = { id: 1, role: 'instructor' };
    const res = httpMocks.createResponse();
    const next = jest.fn();
    authorization(['instructor'])(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
