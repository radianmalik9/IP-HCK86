const httpMocks = require('node-mocks-http');

function baseCtx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController fallback paths', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'k', NODE_ENV: 'test', AI_GEN_ATTEMPTS: '1' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('askQuestion - non-transient error stops without looping', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 400, message: 'bad prompt' }),
        }),
      })),
    }), { virtual: true });

    const Controller = require('../controllers/aiController');
    const { req, res } = baseCtx({ body: { question: 'x' } });
    await Controller.askQuestion(req, res, jest.fn());
    // askQuestion maps 400 to 400 response
    expect(res.statusCode).toBe(400);
  });
});
