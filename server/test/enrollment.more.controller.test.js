const httpMocks = require('node-mocks-http');

jest.mock('../models', () => ({
  Enrollment: { findAll: jest.fn() },
  Course: {},
  User: {},
}));

const { Enrollment } = require('../models');
const Controller = require('../controllers/enrollmentController');

function ctx(userId = 1) {
  const req = httpMocks.createRequest({ method: 'GET' });
  req.user = { id: userId, role: 'student' };
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  return { req, res, next };
}

describe('EnrollmentController more', () => {
  afterEach(() => jest.clearAllMocks());

  test('getMyEnrollments - ok', async () => {
    Enrollment.findAll.mockResolvedValue([{ id: 1 }]);
    const { req, res } = ctx();
    await Controller.getMyEnrollments(req, res, jest.fn());
    expect(res.statusCode).toBe(200);
  });
});
