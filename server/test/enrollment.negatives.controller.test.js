const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn() },
  Course: { findByPk: jest.fn() },
  Lesson: { findAll: jest.fn() },
  Progress: { findOne: jest.fn(), create: jest.fn(), count: jest.fn() },
}));

const { Enrollment, Course } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ method = 'POST', params = {}, body = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method, params, body });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController negative branches', () => {
  afterEach(() => jest.clearAllMocks());

  test('enrollCourse - course not found or not published -> NotFound', async () => {
    Course.findByPk.mockResolvedValue(null);
    const { req, res, next } = ctx({ params: { courseId: 99 } });
    await Controller.enrollCourse(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('toggleFavorite - enrollment not found -> NotFound', async () => {
    Enrollment.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ method: 'PATCH', params: { courseId: 1 } });
    await Controller.toggleFavorite(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('unenrollCourse - enrollment not found -> NotFound', async () => {
    Enrollment.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ method: 'DELETE', params: { courseId: 1 } });
    await Controller.unenrollCourse(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });
});
