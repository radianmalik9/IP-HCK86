const httpMocks = require('node-mocks-http');

function ctx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController JSON parse fallbacks', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'key' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('generateStudyPlan falls back to text when JSON.parse fails', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'plain text' } }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res } = ctx({ body: { courseTitle: 'X', userLevel: 'beginner', availableTime: 1, deadline: 'soon' } });
    await Controller.generateStudyPlan(req, res, jest.fn());
    const body = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(body.data.studyPlan.description).toContain('plain text');
  });

  test('getPersonalizedRecommendations falls back to text description when JSON.parse fails', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'not json' } }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res } = ctx({ body: { interests: 'JS', currentLevel: 'beginner', learningGoals: 'web' } });
    await Controller.getPersonalizedRecommendations(req, res, jest.fn());
    const body = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(body.data.recommendations)).toBe(true);
    expect(body.data.recommendations[0].description).toContain('not json');
  });

  test('generateQuiz falls back to content when JSON.parse fails', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'quiz text' } }),
        }),
      })),
    }), { virtual: true });
    const Controller = require('../controllers/aiController');
    const { req, res } = ctx({ body: { topic: 'JS', difficulty: 'easy', questionCount: 3 } });
    await Controller.generateQuiz(req, res, jest.fn());
    const body = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(body.data.quiz.content).toContain('quiz text');
  });
});
