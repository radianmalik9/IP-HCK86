const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn() },
  Course: {},
  Lesson: { findAll: jest.fn() },
  Progress: { findAll: jest.fn() },
}));

const { Enrollment, Lesson, Progress } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ method = 'GET', params = {}, body = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method, params, body });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController progress endpoints', () => {
  afterEach(() => jest.clearAllMocks());

  test('getProgress - found', async () => {
    Enrollment.findOne.mockResolvedValue({ id: 1, progress: 70 });
    const { req, res } = ctx({ params: { courseId: 5 } });
    await Controller.getProgress(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data.progress).toBe(70);
  });

  test('getProgress - not found -> NotFound', async () => {
    Enrollment.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ params: { courseId: 5 } });
    await Controller.getProgress(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('updateProgress - sets completedAt at 100', async () => {
    const enrollment = { id: 1, progress: 0, update: jest.fn() };
    Enrollment.findOne.mockResolvedValue(enrollment);
    const { req, res } = ctx({ method: 'PATCH', params: { courseId: 5 }, body: { progress: 100 } });
    await Controller.updateProgress(req, res, jest.fn());
    expect(enrollment.update).toHaveBeenCalledWith(expect.objectContaining({ progress: 100 }));
    expect(res.statusCode).toBe(200);
  });

  test('getCompletedLessons - no lessons -> []', async () => {
    Lesson.findAll.mockResolvedValue([]);
    const { req, res } = ctx({ params: { courseId: 5 } });
    await Controller.getCompletedLessons(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data).toEqual([]);
  });

  test('getCompletedLessons - returns ids', async () => {
    Lesson.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    Progress.findAll.mockResolvedValue([{ lessonId: 1 }]);
    const { req, res } = ctx({ params: { courseId: 5 } });
    await Controller.getCompletedLessons(req, res, jest.fn());
    const body = res._getJSONData();
    expect(body.data).toEqual([1]);
  });
});
