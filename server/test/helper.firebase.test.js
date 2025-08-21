describe('helper/firebase uploadFile', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV };
  });
  afterAll(() => {
    process.env = ORIG_ENV;
  });

  test('throws when not configured', async () => {
    jest.isolateModules(() => {
      const mod = require('../helper/firebase');
      return mod.uploadFile({ mimetype: 'image/png', buffer: Buffer.from('a') }, 'dest')
        .then(() => { throw new Error('should not resolve'); })
        .catch((e) => {
          expect(e).toBeInstanceOf(Error);
        });
    });
  });
});
