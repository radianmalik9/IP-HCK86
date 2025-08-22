jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'x', accepted: ['a@b.com'] })
  })
}));

describe('helper/mailer', () => {
  const nodemailer = require('nodemailer');
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('createTransporter uses jsonTransport when no host/port', async () => {
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    const mailer = require('../helper/mailer');
    const transporter = mailer.createTransporter();
    expect(typeof transporter.sendMail).toBe('function');
    const info = await transporter.sendMail({ to: 'a@b.com', subject: 's' });
    expect(info).toHaveProperty('messageId');
  });

  test('createTransporter uses SMTP when host/port provided and sendMail uses default from', async () => {
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'user@example.com';
    process.env.EMAIL_PASS = 'secret';
    jest.resetModules();
    const mailer = require('../helper/mailer');
    const transporter = mailer.createTransporter();
    expect(typeof transporter.sendMail).toBe('function');
    const info = await mailer.sendMail({ to: 'x@y.com', subject: 'Hi', text: 'Body' });
    expect(info.accepted).toContain('a@b.com');
  });
});
