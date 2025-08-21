const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  User: { create: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), update: jest.fn(), findOne: jest.fn() },
}));

jest.mock('../helper/mailer', () => ({ sendMail: jest.fn() }));

jest.mock('firebase-admin', () => ({
  apps: [1],
  auth: () => ({ verifyIdToken: jest.fn().mockResolvedValue({ email: 'g@example.com', name: 'G User', picture: 'p' }) }),
}));

jest.mock('axios');
const axios = require('axios');

jest.mock('../helper/jwt', () => ({ signToken: jest.fn().mockReturnValue('jwt') }));

const { User } = require('../models');
const Controller = require('../controllers/userController');

function ctx({ method = 'GET', params = {}, query = {}, body = {}, user = { id: 1, role: 'admin' } } = {}) {
  const req = httpMocks.createRequest({ method, params, query, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController extra flows', () => {
  afterEach(() => jest.clearAllMocks());

  test('getProfile - returns user without password', async () => {
    User.findByPk.mockResolvedValue({ id: 1, email: 'a@a.com' });
    const { req, res } = ctx({ user: { id: 1, role: 'student' } });
    await Controller.getProfile(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });

  test('getUsers - pagination and search', async () => {
    User.findAndCountAll.mockResolvedValue({ rows: [{ id: 1 }], count: 1 });
    const { req, res } = ctx({ query: { page: 1, limit: 10, search: 'a', role: 'student' } });
    await Controller.getUsers(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });

  test('getUserById - not found', async () => {
    User.findByPk.mockResolvedValue(null);
    const { req, res, next } = ctx({ params: { id: 99 } });
    await Controller.getUserById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('createUser - non-admin cannot set role', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 2, email: 'b@b.com', fullName: 'B', role: 'student', profilePicture: null, isVerified: false });
    const { req, res } = ctx({ method: 'POST', body: { email: 'b@b.com', password: '123456', fullName: 'B', role: 'admin' }, user: { id: 2, role: 'instructor' } });
    await Controller.createUser(req, res, jest.fn());
    const body = res._getJSONData();
    expect(body.data.role).toBe('student');
  });

  test('updateUser - forbidden when not self or admin', async () => {
    const { req, res, next } = ctx({ method: 'PUT', params: { id: '7' }, user: { id: 1, role: 'student' }, body: { fullName: 'X' } });
    await Controller.updateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Forbidden' }));
  });

  test('deleteUser - forbidden when not self or admin', async () => {
    const { req, res, next } = ctx({ method: 'DELETE', params: { id: '7' }, user: { id: 1, role: 'student' } });
    await Controller.deleteUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'Forbidden' }));
  });

  test('googleSignIn - success with firebase-admin', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 3, email: 'g@example.com', fullName: 'G User', role: 'student', profilePicture: 'p' });
    const { req, res } = ctx({ method: 'POST', body: { idToken: 'abc' } });
    await Controller.googleSignIn(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });

  test('googleOAuth - missing client env -> BadRequest', async () => {
    const { req, res, next } = ctx({ method: 'POST', body: { code: 'x', redirectUri: 'http://localhost:5173/oauth2/callback' } });
    await Controller.googleOAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('googleOAuth - happy path (mock axios)', async () => {
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    axios.post.mockResolvedValue({ data: { access_token: 'at', id_token: 'it' } });
    axios.get.mockResolvedValue({ data: { email: 'u@x.com', name: 'UX', picture: 'pic' } });
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 9, email: 'u@x.com', fullName: 'UX', role: 'student', profilePicture: 'pic' });
    const { req, res } = ctx({ method: 'POST', body: { code: 'auth-code' } });
    await Controller.googleOAuth(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });
});
