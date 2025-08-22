const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findOne: jest.fn(), findAll: jest.fn() },
  Course: {},
  User: {},
}));

const { Enrollment } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx({ params = {}, body = {}, userId = 1 } = {}) {
  const req = httpMocks.createRequest({ method: 'POST', params, body });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController favorites', () => {
  afterEach(() => jest.clearAllMocks());

  test('toggleFavorite - flips flag', async () => {
    const enrollment = { id: 1, isFavorite: false, update: jest.fn(function (upd) { this.isFavorite = upd.isFavorite; return Promise.resolve(this); }) };
    Enrollment.findOne.mockResolvedValue(enrollment);
    const { req, res } = ctx({ params: { courseId: 9 } });
    await Controller.toggleFavorite(req, res, jest.fn());
    expect(enrollment.update).toHaveBeenCalledWith(expect.objectContaining({ isFavorite: true }));
    expect(res.statusCode).toBe(200);
  });

  test('addFavorite - not enrolled -> NotFound', async () => {
    Enrollment.findOne.mockResolvedValue(null);
    const { req, res, next } = ctx({ body: { courseId: 9 } });
    await Controller.addFavorite(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'NotFound' }));
  });

  test('removeFavorite - success', async () => {
    const enrollment = { id: 2, isFavorite: true, update: jest.fn() };
    Enrollment.findOne.mockResolvedValue(enrollment);
    const { req, res } = ctx({ params: { courseId: 9 } });
    await Controller.removeFavorite(req, res, jest.fn());
    expect(enrollment.update).toHaveBeenCalledWith({ isFavorite: false });
    expect(res.statusCode).toBe(200);
  });

  test('getFavorites - returns list', async () => {
    Enrollment.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const { req, res } = ctx();
    await Controller.getFavorites(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });
});
