const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Course: { findOne: jest.fn() },
  Lesson: { findAll: jest.fn() },
}));

const { Course } = require('../models');
const Controller = require('../controllers/courseController');

function ctx({ method = 'PATCH', params = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method, params });
  req.user = { id: userId, role: 'instructor' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('CourseController publishCourse toggles both ways', () => {
  afterEach(() => jest.clearAllMocks());

  test('publishCourse - unpublish when already published', async () => {
    const course = { id: 3, isPublished: true, update: jest.fn(function (u) { this.isPublished = u.isPublished; return Promise.resolve(this); }) };
    Course.findOne.mockResolvedValue(course);
    const { req, res } = ctx({ params: { id: 3 } });
    await Controller.publishCourse(req, res, jest.fn());
    expect(course.update).toHaveBeenCalledWith(expect.objectContaining({ isPublished: false }));
    expect(res.statusCode).toBe(200);
  });
});
