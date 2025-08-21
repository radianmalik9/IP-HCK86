const httpMocks = require('node-mocks-http');

function baseCtx({ method = 'POST', body = {}, user = { id: 1 } } = {}) {
  const req = httpMocks.createRequest({ method, body });
  req.user = user;
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('AIController genWithFallback duplicate candidate skip', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV, GOOGLE_AI_API_KEY: 'k', NODE_ENV: 'test', AI_MODEL_FALLBACKS: 'dup,alt-1,dup' };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('askQuestion still succeeds with duplicate names in candidates', async () => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn()
            // first candidate (base) fails with 503 to trigger fallback
            .mockRejectedValueOnce({ status: 503 })
            // second candidate 'dup' succeeds
            .mockResolvedValueOnce({ response: { text: () => 'ok' } })
        }),
      })),
    }), { virtual: true });

    const Controller = require('../controllers/aiController');
    const { req, res, next } = baseCtx({ body: { question: 'Q' } });
    await Controller.askQuestion(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().data.answer).toBe('ok');
  });
});
