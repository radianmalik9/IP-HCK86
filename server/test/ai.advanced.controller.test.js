const httpMocks = require('node-mocks-http');

function baseCtx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController advanced flows', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, NODE_ENV: 'test', GOOGLE_AI_API_KEY: 'k' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('getPersonalizedRecommendations - returns JSON', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => '{"recommendations":[{"topic":"T"}]}' } }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = baseCtx({ body: { interests: 'JS', currentLevel: 'beginner', learningGoals: 'web' } });
      await Controller.getPersonalizedRecommendations(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(200);
      const body = res._getJSONData();
      expect(body.data.recommendations).toBeDefined();
    });
  });

  test('askQuestion - success', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'Answer text' } }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = baseCtx({ body: { question: 'Apa itu JS?', context: 'programming' } });
      await Controller.askQuestion(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(200);
      const body = res._getJSONData();
      expect(body.data.answer).toContain('Answer');
    });
  });

  test('askQuestion - cooldown returns 429', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'OK' } }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');

      const c1 = baseCtx({ body: { question: 'Hi' } });
      await Controller.askQuestion(c1.req, c1.res, jest.fn());
      await new Promise((resolve) => { if (c1.res.writableEnded) return resolve(); c1.res.on('end', resolve); });
      expect(c1.res.statusCode).toBe(200);

      const c2 = baseCtx({ body: { question: 'Again' } });
      await Controller.askQuestion(c2.req, c2.res, jest.fn());
      await new Promise((resolve) => { if (c2.res.writableEnded) return resolve(); c2.res.on('end', resolve); });
      expect(c2.res.statusCode).toBe(429);
    });
  });

  test('askQuestion - upstream 429 mapped to 429', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 429, message: 'rate' }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = baseCtx({ body: { question: 'Q' } });
      await Controller.askQuestion(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(429);
    });
  });

  test('askQuestion - upstream 503 mapped to 503', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue({ status: 503, message: 'svc down' }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = baseCtx({ body: { question: 'Q' } });
      await Controller.askQuestion(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(503);
    });
  });
});
