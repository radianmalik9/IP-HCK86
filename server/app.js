const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// Error Handler
app.use(errorHandler);

module.exports = app;
