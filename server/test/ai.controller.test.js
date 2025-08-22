const httpMocks = require('node-mocks-http');

// We'll mock the SDK within an isolated module per test to avoid cross-file env interference

let Controller;

function loadControllerWithMock() {
  jest.isolateModules(() => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({ response: { text: () => '{"quiz": {"title": "T", "difficulty": "easy", "questions": []}}' } }),
        }),
      })),
    }), { virtual: true });
    Controller = require('../controllers/aiController');
  });
}

function ctx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController basic', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'test-key', NODE_ENV: 'test' };
    loadControllerWithMock();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('generateQuiz - returns parsed JSON', async () => {
  const { req, res } = ctx({ body: { topic: 'JS', difficulty: 'easy', questionCount: 3 } });
  await Controller.generateQuiz(req, res, jest.fn());
    // wait for response to finish to avoid race with node-mocks-http
    await new Promise((resolve) => {
      if (res.writableEnded) return resolve();
      res.on('end', resolve);
    });
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data.quiz).toBeDefined();
  });

  test('askQuestion - rejects empty', async () => {
  const { req, res } = ctx({ body: { question: '   ' } });
  await Controller.askQuestion(req, res, jest.fn());
    expect(res.statusCode).toBe(400);
  });
});
