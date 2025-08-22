const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn(), create: jest.fn() },
  Course: { findByPk: jest.fn() },
  User: {},
  Lesson: { findAll: jest.fn() },
  Progress: { findOne: jest.fn(), create: jest.fn(), count: jest.fn() },
}));

const { Enrollment, Course, Lesson, Progress } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ userId = 1, params = {}, body = {}, headers = {} } = {}) {
  const req = httpMocks.createRequest({ method: 'GET', params, body, headers });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController', () => {
  afterEach(() => jest.clearAllMocks());

  test('enrollCourse - success', async () => {
    Course.findByPk.mockResolvedValue({ id: 10, isPublished: true });
    Enrollment.findOne.mockResolvedValue(null);
    Enrollment.create.mockResolvedValue({ id: 1, userId: 1, courseId: 10 });
    const { req, res, next } = ctx({ params: { courseId: 10 } });
    await Controller.enrollCourse(req, res, next);
    expect(res.statusCode).toBe(201);
    expect(Enrollment.create).toHaveBeenCalled();
  });

  test('enrollCourse - already enrolled', async () => {
    Course.findByPk.mockResolvedValue({ id: 10, isPublished: true });
    Enrollment.findOne.mockResolvedValue({ id: 2 });
    const { req, res, next } = ctx({ params: { courseId: 10 } });
    await Controller.enrollCourse(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequest' }));
  });

  test('unenrollCourse - removes enrollment', async () => {
    Enrollment.findOne.mockResolvedValue({ id: 5, destroy: jest.fn() });
    const { req, res, next } = ctx({ params: { courseId: 10 } });
    await Controller.unenrollCourse(req, res, next);
    expect(res.statusCode).toBe(200);
  });

  test('markLessonComplete - recompute progress', async () => {
    Enrollment.findOne.mockResolvedValue({ id: 1, progress: 0, update: jest.fn() });
    Progress.findOne.mockResolvedValue(null);
    Lesson.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
    Progress.count.mockResolvedValue(2);
    const { req, res, next } = ctx({ params: { courseId: 10, lessonId: 2 } });
    await Controller.markLessonComplete(req, res, next);
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data.percent).toBe(40);
  });
});
