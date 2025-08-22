const admin = require('firebase-admin');

let firebaseEnabled = false;
let bucket = null;

try {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];
  const hasAll = required.every((k) => !!process.env[k]);

  if (hasAll) {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    bucket = admin.storage().bucket();
    firebaseEnabled = true;
  } else {
    // Skip initialization; will use stub uploader
    firebaseEnabled = false;
  }
} catch (err) {
  // Do not crash the app; log in dev
  console.warn('[firebase] initialization skipped:', err?.message || err);
  // In tests, allow proceeding if a mocked storage().bucket() is available
  if (process.env.NODE_ENV === 'test') {
    try {
      const storage = typeof admin.storage === 'function' ? admin.storage() : null;
      bucket = storage && typeof storage.bucket === 'function' ? storage.bucket() : null;
      firebaseEnabled = !!bucket;
    } catch (_) {
      firebaseEnabled = false;
    }
  } else {
    firebaseEnabled = false;
  }
}

const uploadFile = async (file, destination) => {
  if (!firebaseEnabled || !bucket) {
    throw new Error('Firebase Storage is not configured. Set FIREBASE_* envs to enable uploads.');
  }
  try {
    const fileUpload = bucket.file(destination);
    const stream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
    });
    return new Promise((resolve, reject) => {
      stream.on('error', (err) => reject(err));
      stream.on('finish', async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          resolve(publicUrl);
        } catch (e) {
          reject(new Error('Failed to upload file: ' + (e?.message || e)));
        }
      });
      stream.end(file.buffer);
    });
  } catch (error) {
    throw new Error('Failed to upload file: ' + error.message);
  }
};

module.exports = {
  bucket,
  uploadFile,
  firebaseEnabled,
};
