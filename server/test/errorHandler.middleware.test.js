const httpMocks = require('node-mocks-http');
const { errorHandler } = require('../middlewares/errorHandler');

function run(handlerError) {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
  const next = jest.fn();
  errorHandler(handlerError, req, res, next);
  return res;
}

describe('errorHandler middleware', () => {
  test('default 500', () => {
    const res = run(new Error('boom'));
    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body).toEqual({ success: false, message: 'Internal Server Error' });
  });

  test('NotFound', () => {
    const res = run({ name: 'NotFound', message: 'x' });
    expect(res.statusCode).toBe(404);
  });

  test('Unauthorized', () => {
    const res = run({ name: 'Unauthorized', message: 'Access token is required' });
    expect(res.statusCode).toBe(401);
  });

  test('SequelizeValidationError', () => {
    const res = run({ name: 'SequelizeValidationError', errors: [{ message: 'invalid' }] });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('invalid');
  });
  
  test('SequelizeUniqueConstraintError', () => {
    const res = run({ name: 'SequelizeUniqueConstraintError', errors: [{ message: 'duplicate' }] });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('duplicate');
  });
  
  test('SequelizeForeignKeyConstraintError', () => {
    const res = run({ name: 'SequelizeForeignKeyConstraintError' });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('Foreign key constraint error');
  });
  
  test('TokenExpiredError', () => {
    const res = run({ name: 'TokenExpiredError' });
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toBe('Token expired');
  });
  
  test('Generic error with status forwards status/message', () => {
    const res = run({ status: 418, message: "I'm a teapot" });
    expect(res.statusCode).toBe(418);
    expect(res._getJSONData().message).toBe("I'm a teapot");
  });

  test('JsonWebTokenError -> 401 Invalid token', () => {
    const res = run({ name: 'JsonWebTokenError' });
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toBe('Invalid token');
  });

  test('Forbidden -> 403', () => {
    const res = run({ name: 'Forbidden', message: 'Access denied' });
    expect(res.statusCode).toBe(403);
    expect(res._getJSONData().message).toBe('Access denied');
  });

  test('BadRequest -> 400 with custom message', () => {
    const res = run({ name: 'BadRequest', message: 'Invalid input' });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('Invalid input');
  });

  test('BadRequest -> 400 default message when missing', () => {
    const res = run({ name: 'BadRequest' });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('Bad request');
  });

  test('Unauthorized -> 401 default message when missing', () => {
    const res = run({ name: 'Unauthorized' });
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toBe('Unauthorized access');
  });

  test('Forbidden -> 403 default message when missing', () => {
    const res = run({ name: 'Forbidden' });
    expect(res.statusCode).toBe(403);
    expect(res._getJSONData().message).toBe('Access forbidden');
  });

  test('NotFound -> 404 default message when missing', () => {
    const res = run({ name: 'NotFound' });
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe('Data not found');
  });
});
