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

describe('CourseController', () => {
  afterEach(() => jest.clearAllMocks());

  test('getAllCourses - ok', async () => {
    Course.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const { req, res, next } = ctx({ query: { search: 'react', level: 'beginner', category: 'web' } });
    await Controller.getAllCourses(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(Course.findAll).toHaveBeenCalled();
  });

  test('getCourseById - found', async () => {
    Course.findByPk.mockResolvedValue({ id: 10 });
    const { req, res, next } = ctx({ params: { id: 10 } });
    await Controller.getCourseById(req, res, next);
    expect(res.statusCode).toBe(200);
  });

  test('getCourseById - not found -> NotFound', async () => {
    Course.findByPk.mockResolvedValue(null);
    const { req, res, next } = ctx({ params: { id: 999 } });
    await Controller.getCourseById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('createCourse - with file upload', async () => {
    const created = { id: 7, title: 'T', instructorId: 1 };
    Course.create.mockResolvedValue(created);
    const { req, res } = ctx({ method: 'POST', body: { title: 'T', description: 'D' }, file: { originalname: 'x.png' } });
    await Controller.createCourse(req, res, jest.fn());
    expect(uploadFile).toHaveBeenCalled();
    expect(Course.create).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
  });

  test('updateCourse - not found -> NotFound', async () => {
    Course.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ method: 'PUT', params: { id: 1 }, body: { title: 'New' } });
    await Controller.updateCourse(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('updateCourse - with file, success', async () => {
    const course = { id: 1, update: jest.fn(), isPublished: false };
    Course.findOne.mockResolvedValue(course);
    const { req, res } = ctx({ method: 'PUT', params: { id: 1 }, body: { title: 'New' }, file: { originalname: 'y.jpg' } });
    await Controller.updateCourse(req, res, jest.fn());
    expect(uploadFile).toHaveBeenCalled();
    expect(course.update).toHaveBeenCalledWith(expect.objectContaining({ title: 'New', thumbnail: expect.any(String) }));
    expect(res.statusCode).toBe(200);
  });

  test('deleteCourse - success', async () => {
    const course = { id: 1, destroy: jest.fn() };
    Course.findOne.mockResolvedValue(course);
    const { req, res } = ctx({ method: 'DELETE', params: { id: 1 } });
    await Controller.deleteCourse(req, res, jest.fn());
    expect(course.destroy).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test('publishCourse - toggles flag', async () => {
    const course = { id: 3, isPublished: false, update: jest.fn(function (updates) { this.isPublished = updates.isPublished; return Promise.resolve(this); }) };
    Course.findOne.mockResolvedValue(course);
    const { req, res } = ctx({ method: 'PATCH', params: { id: 3 } });
    await Controller.publishCourse(req, res, jest.fn());
    expect(course.update).toHaveBeenCalledWith(expect.objectContaining({ isPublished: true }));
    expect(res.statusCode).toBe(200);
  });
});
