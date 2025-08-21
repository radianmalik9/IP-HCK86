const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
// Load env from .env by default; fallback to ./env if present
const dotEnvPath = path.join(__dirname, '.env');
const altEnvPath = path.join(__dirname, 'env');
const envPath = fs.existsSync(dotEnvPath) ? dotEnvPath : (fs.existsSync(altEnvPath) ? altEnvPath : undefined);
dotenv.config(envPath ? { path: envPath } : undefined);
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Smart Learning Server is running on port ${PORT}`);
});
