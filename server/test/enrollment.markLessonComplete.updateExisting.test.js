const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn() },
  Lesson: { findAll: jest.fn() },
  Progress: { findOne: jest.fn(), count: jest.fn() },
}));

const { Enrollment, Lesson, Progress } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ params = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method: 'POST', params });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController markLessonComplete update existing branch', () => {
  afterEach(() => jest.clearAllMocks());

  test('updates existing progress if not completed and recomputes percent', async () => {
    const update = jest.fn();
    Enrollment.findOne.mockResolvedValue({ id: 1, progress: 0, update });
    Progress.findOne.mockResolvedValue({ id: 9, isCompleted: false, update: jest.fn() });
    Lesson.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    Progress.count.mockResolvedValue(1);

    const { req, res } = ctx({ params: { courseId: 10, lessonId: 2 } });
    await Controller.markLessonComplete(req, res, jest.fn());

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.data.percent).toBe(50);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ progress: 50 }));
  });
});
