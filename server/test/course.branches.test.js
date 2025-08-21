const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Course: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), findOne: jest.fn() },
  User: {},
  Lesson: { findAll: jest.fn() },
}));

jest.mock('../helper/firebase', () => ({
  uploadFile: jest.fn().mockResolvedValue('https://storage.example/abc.jpg'),
}));

const { Course } = require('../models');
const { uploadFile } = require('../helper/firebase');
const Controller = require('../controllers/courseController');

function ctx({ method = 'GET', params = {}, query = {}, body = {}, file = null, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method, params, query, body, file });
  req.user = { id: userId, role: 'instructor' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('CourseController extra branches', () => {
  afterEach(() => jest.clearAllMocks());

  test('getAllCourses - no filters branch', async () => {
    Course.findAll.mockResolvedValue([{ id: 1 }]);
    const { req, res, next } = ctx();
    await Controller.getAllCourses(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(Course.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isPublished: true }) }));
  });

  test('createCourse - without file keeps thumbnail null', async () => {
    const created = { id: 9, title: 'T', thumbnail: null };
    Course.create.mockResolvedValue(created);
    const { req, res } = ctx({ method: 'POST', body: { title: 'T', description: 'D' } });
    await Controller.createCourse(req, res, jest.fn());
    expect(uploadFile).not.toHaveBeenCalled();
    const body = res._getJSONData();
  expect(body.data.thumbnail).toBeNull();
    expect(res.statusCode).toBe(201);
  });

  test('publishCourse - not found -> NotFound', async () => {
    Course.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ method: 'PATCH', params: { id: 404 } });
    await Controller.publishCourse(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });
});
