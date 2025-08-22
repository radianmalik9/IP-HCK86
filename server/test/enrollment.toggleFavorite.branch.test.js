const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn() },
}));

const { Enrollment } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ method = 'PATCH', params = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method, params });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController toggleFavorite branch', () => {
  afterEach(() => jest.clearAllMocks());

  test('toggles from true to false and returns message removed from favorites', async () => {
    const update = jest.fn(function (payload) { this.isFavorite = payload.isFavorite; return Promise.resolve(this); });
    const enrollment = { id: 1, userId: 1, courseId: 3, isFavorite: true, update };
    Enrollment.findOne.mockResolvedValue(enrollment);

    const { req, res } = ctx({ params: { courseId: 3 } });
    await Controller.toggleFavorite(req, res, jest.fn());

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.message).toMatch(/removed from/);
    expect(enrollment.isFavorite).toBe(false);
  });
});
