const httpMocks = require('node-mocks-http');

function baseCtx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController branch coverage extras', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
  process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'k', NODE_ENV: 'test', AI_ASK_COOLDOWN_MS: '0' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('askQuestion - 400 branch from upstream error', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 400, message: 'bad prompt' }),
        }),
      })),
    }), { virtual: true });

    const Controller = require('../controllers/aiController');
    const { req, res } = baseCtx({ body: { question: 'Q' } });
    await Controller.askQuestion(req, res, jest.fn());
    expect(res.statusCode).toBe(400);
  });

  test('askQuestion - unexpected error bubbles to error middleware', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 418, message: "I'm a teapot" }),
        }),
      })),
    }), { virtual: true });

    const Controller = require('../controllers/aiController');
    const { req, res, next } = baseCtx({ body: { question: 'Q' } });
    await Controller.askQuestion(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 418 }));
  });
});
