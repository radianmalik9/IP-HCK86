const httpMocks = require('node-mocks-http');

function ctx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController explainConcept', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'k' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('success returns explanation text', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'penjelasan' } }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res } = ctx({ body: { concept: 'Closure' } });
    await Controller.explainConcept(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data.explanation).toContain('penjelasan');
  });

  test('429 maps to 429 response', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 429 }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res } = ctx({ body: { concept: 'X' } });
    await Controller.explainConcept(req, res, jest.fn());
    expect(res.statusCode).toBe(429);
  });

  test('503 maps to 503 response', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 503 }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res } = ctx({ body: { concept: 'Y' } });
    await Controller.explainConcept(req, res, jest.fn());
    expect(res.statusCode).toBe(503);
  });

  test('unexpected error in explainConcept bubbles to error middleware', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          // cause non-429/503 rejection to hit throw err and outer catch
          generateContent: jest.fn().mockRejectedValue({ status: 418, message: "I'm a teapot" }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res, next } = ctx({ body: { concept: 'Err' } });
    await Controller.explainConcept(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 418 }));
  });
});
