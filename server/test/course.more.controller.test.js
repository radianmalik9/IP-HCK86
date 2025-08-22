const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Course: { findAll: jest.fn() },
  Lesson: { findAll: jest.fn() },
}));

const { Course } = require('../models');
const Controller = require('../controllers/courseController');

function ctx(userId = 1) {
  const req = httpMocks.createRequest({ method: 'GET' });
  req.user = { id: userId, role: 'instructor' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('CourseController more', () => {
  afterEach(() => jest.clearAllMocks());

  test('getMyCourses - ok', async () => {
    Course.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const { req, res } = ctx();
    await Controller.getMyCourses(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });
});
