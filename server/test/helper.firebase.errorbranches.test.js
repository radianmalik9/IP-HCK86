describe('helper/firebase uploadFile error branches', () => {
  const ORIG_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIG_ENV,
      NODE_ENV: 'test',
      FIREBASE_PROJECT_ID: 'pid',
      FIREBASE_CLIENT_EMAIL: 'svc@example.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n',
      FIREBASE_STORAGE_BUCKET: 'test-bucket',
    };
  });
  afterAll(() => { process.env = ORIG_ENV; });

  test('rejects when write stream emits error', async () => {
    await jest.isolateModulesAsync(async () => {
      const fakeBucket = {
        name: 'test-bucket',
        file: jest.fn(() => ({
          createWriteStream: jest.fn(() => {
            const EventEmitter = require('events');
            const emitter = new EventEmitter();
            const stream = {
              on: (evt, cb) => { emitter.on(evt, cb); return stream; },
              end: () => { setImmediate(() => emitter.emit('error', new Error('stream failure'))); },
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
      await expect(uploadFile(file, 'images/x.png')).rejects.toThrow('stream failure');
    });
  });

  test('rejects when makePublic fails after finish', async () => {
    await jest.isolateModulesAsync(async () => {
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
          makePublic: jest.fn().mockRejectedValue(new Error('perm denied')),
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
      await expect(uploadFile(file, 'images/y.png')).rejects.toThrow('Failed to upload file: perm denied');
    });
  });

  test('initialization error falls back to test bucket and still uploads', async () => {
    await jest.isolateModulesAsync(async () => {
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
        credential: { cert: jest.fn(() => { throw new Error('bad key'); }) },
        storage: () => ({ bucket: () => fakeBucket }),
      }), { virtual: true });

      const { uploadFile } = require('../helper/firebase');
      const file = { buffer: Buffer.from('ok'), mimetype: 'image/png' };
      const url = await uploadFile(file, 'images/fallback.png');
      expect(url).toBe('https://storage.googleapis.com/test-bucket/images/fallback.png');
    });
  });

  test('outer try/catch captures sync errors (bucket.file throws)', async () => {
    await jest.isolateModulesAsync(async () => {
      const fakeBucket = {
        name: 'test-bucket',
        file: jest.fn(() => { throw new Error('boom'); }),
      };

      jest.doMock('firebase-admin', () => ({
        apps: [],
        initializeApp: jest.fn(),
        credential: { cert: jest.fn(() => ({})) },
        storage: () => ({ bucket: () => fakeBucket }),
      }), { virtual: true });

      const { uploadFile } = require('../helper/firebase');
      const file = { buffer: Buffer.from('x'), mimetype: 'image/png' };
      await expect(uploadFile(file, 'images/sync.png')).rejects.toThrow('Failed to upload file: boom');
    });
  });
});
