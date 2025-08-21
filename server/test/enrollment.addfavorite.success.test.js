const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn() },
}));

const { Enrollment } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ body = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method: 'POST', body });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController addFavorite success', () => {
  afterEach(() => jest.clearAllMocks());

  test('addFavorite - success when enrolled', async () => {
    const enrollment = { id: 1, isFavorite: false, update: jest.fn() };
    Enrollment.findOne.mockResolvedValue(enrollment);
    const { req, res } = ctx({ body: { courseId: 9 } });
    await Controller.addFavorite(req, res, jest.fn());
    expect(enrollment.update).toHaveBeenCalledWith({ isFavorite: true });
    expect(res.statusCode).toBe(200);
  });
});
