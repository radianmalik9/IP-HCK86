const httpMocks = require('node-mocks-http');

jest.mock('axios');
const axios = require('axios');

jest.mock('../models', () => ({
  User: { findOne: jest.fn(), create: jest.fn() },
}));

const Controller = require('../controllers/userController');

function ctx({ method = 'POST', body = {}, user = { id: 1, role: 'student' } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('UserController googleOAuth failure branches', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => { jest.resetModules(); process.env = { ...ORIG_ENV, GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'sec' }; });
  afterAll(() => { process.env = ORIG_ENV; });

  test('token exchange fails -> BadRequest', async () => {
    axios.post.mockRejectedValue({ response: { data: { error_description: 'bad code' } } });
    const { req, res, next } = ctx({ body: { code: 'x' } });
    await Controller.googleOAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('userinfo fetch fails -> BadRequest', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'at', id_token: 'it' } });
    axios.get.mockRejectedValue({ response: { data: { error: 'denied' } } });
    const { req, res, next } = ctx({ body: { code: 'y' } });
    await Controller.googleOAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });
});
