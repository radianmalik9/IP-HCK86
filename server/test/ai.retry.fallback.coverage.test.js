const httpMocks = require('node-mocks-http');

function ctx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController retry/fallback and config branches', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, NODE_ENV: 'test', GOOGLE_AI_API_KEY: 'k', AI_GEN_ATTEMPTS: '2', AI_MODEL_FALLBACKS: 'alt-1' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('genWithRetry retries once on 429 then succeeds', async () => {
    const first = { status: 429, message: 'rate' };
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn()
            .mockRejectedValueOnce(first)
            .mockResolvedValue({ response: { text: () => 'OK' } }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = ctx({ body: { question: 'Q?' } });
      await Controller.askQuestion(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(200);
    });
  });

  test('genWithFallback uses next candidate when first fails with 503', async () => {
    const generateContentFirst = jest.fn().mockRejectedValue({ status: 503 });
    const generateContentSecond = jest.fn().mockResolvedValue({ response: { text: () => 'OK' } });
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockImplementation(({ model }) => ({
          generateContent: model === (process.env.AI_MODEL || 'gemini-1.5-flash')
            ? generateContentFirst
            : generateContentSecond,
        })),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = ctx({ body: { question: 'Hello' } });
      await Controller.askQuestion(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(200);
    });
  });

  test('getPersonalizedRecommendations handles missing response.text gracefully', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          // response.text not provided
          generateContent: jest.fn().mockResolvedValue({ response: { } }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = ctx({ body: { interests: 'Math', currentLevel: 'beginner', learningGoals: 'algebra' } });
      await Controller.getPersonalizedRecommendations(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(200);
      const body = res._getJSONData();
      expect(body.success).toBe(true);
      expect(body.data.recommendations[0].description).toBe('AI response not in JSON format.');
    });
  });

  test('generateQuiz handles missing response.text gracefully', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { /* no text() */ } }),
        }),
      })),
    }), { virtual: true });

    await jest.isolateModulesAsync(async () => {
      const Controller = require('../controllers/aiController');
      const { req, res } = ctx({ body: { topic: 'JS', difficulty: 'easy', questionCount: 3 } });
      await Controller.generateQuiz(req, res, jest.fn());
      await new Promise((resolve) => { if (res.writableEnded) return resolve(); res.on('end', resolve); });
      expect(res.statusCode).toBe(200);
      const body = res._getJSONData();
      expect(body.data.quiz.content).toBe('AI response not in JSON format.');
    });
  });

  test('generateStudyPlan handles missing API key -> BadRequest', async () => {
    process.env = { ...process.env, GOOGLE_AI_API_KEY: '' };
    const Controller = require('../controllers/aiController');
    const { req, res, next } = ctx({ body: { courseTitle: 'X', userLevel: 'B', availableTime: 1, deadline: 'soon' } });
    await Controller.generateStudyPlan(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });
});
