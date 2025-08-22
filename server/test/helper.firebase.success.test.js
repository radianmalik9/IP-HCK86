describe('helper/firebase uploadFile success path', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIG_ENV,
      FIREBASE_PROJECT_ID: 'pid',
      FIREBASE_CLIENT_EMAIL: 'svc@example.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n',
      FIREBASE_STORAGE_BUCKET: 'test-bucket',
    };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('uploadFile returns public url when configured', async () => {
    const fakeFileObj = {};
    const fakeBucket = {
      name: 'test-bucket',
      file: jest.fn(() => ({
        createWriteStream: jest.fn(() => {
          const EventEmitter = require('events');
          const emitter = new EventEmitter();
          const stream = {
            on: (evt, cb) => { emitter.on(evt, cb); return stream; },
            end: () => { setImmediate(() => emitter.emit('finish')); },
          };
          return stream;
        }),
        makePublic: jest.fn().mockResolvedValue(),
      })),
    };

    jest.doMock('firebase-admin', () => ({
      apps: [],
      initializeApp: jest.fn(),
      credential: { cert: jest.fn(() => ({})) },
      storage: () => ({ bucket: () => fakeBucket }),
    }), { virtual: true });

    const { uploadFile } = require('../helper/firebase');
    const file = { buffer: Buffer.from('hello'), mimetype: 'image/png' };
    const url = await uploadFile(file, 'images/x.png');
    expect(url).toBe('https://storage.googleapis.com/test-bucket/images/x.png');
  });
});
