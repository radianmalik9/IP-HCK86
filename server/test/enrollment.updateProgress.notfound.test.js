const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn() },
}));

const { Enrollment } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ method = 'PATCH', params = {}, body = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method, params, body });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController updateProgress NotFound branch', () => {
  afterEach(() => jest.clearAllMocks());

  test('updateProgress - enrollment not found -> NotFound', async () => {
    Enrollment.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ params: { courseId: 7 }, body: { progress: 50 } });
    await Controller.updateProgress(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });
});
