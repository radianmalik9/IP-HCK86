const httpMocks = require('node-mocks-http');

function baseCtx({ method = 'POST', body = {} } = {}) {
  const req = httpMocks.createRequest({ method, body });
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController generateStudyPlan - missing response.text branch', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'k', NODE_ENV: 'test' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('falls back when response.text is missing', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: {} }),
        }),
      })),
    }), { virtual: true });

    const Controller = require('../controllers/aiController');
    const { req, res, next } = baseCtx({ body: { courseTitle: 'X', userLevel: 'beginner', availableTime: 1, deadline: 'soon' } });
    await Controller.generateStudyPlan(req, res, next);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.success).toBe(true);
    expect(data.data.studyPlan).toBeDefined();
    expect(data.data.studyPlan.description).toBeDefined();
  });
});
