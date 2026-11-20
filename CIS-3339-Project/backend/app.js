// This is the main file for the backend

// import functionalities
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const cors = require('cors');
// allow using a .env file
require('dotenv').config(); //require the dotenv

// creates a new instance of express application
const app = express();

// add cors header to the server
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.trim() : false
  })
);

// suppress mongoose warning to prepare for new version
mongoose.set('strictQuery', false);

// sets up mongoose for the mongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Database connection Success!');
  })
  .catch((err) => {
    console.error('Mongo Connection Error', err);
  });

// declare port number for the api
const PORT = process.env.PORT || 3000;

// setup and access request body
app.use(express.json());
app.use(morgan('dev'));

// setup middle ware for routes
app.use('/clients', require('./routes/clients'));
app.use('/events', require('./routes/events'));
app.use('/org', require('./routes/org'));
app.use('/services', require('./routes/services'));
app.use('/users', require('./routes/users'));

// B2: health check — no login needed
app.get('/health', (req, res) => {
  // readyState 1 means Mongoose is connected to MongoDB
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'error',
    db: dbConnected ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// B2: unknown routes -> 404 in the same JSON shape
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.statusCode = 404;
  next(err);
});

// B2: centralized error handler (must be registered after all routes)
app.use((err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message;

  // Mongoose validation error (missing/invalid fields) -> 400
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Invalid MongoDB id (e.g. /clients/abc) -> 400
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }

  // Unexpected server errors: log the details for us, but hide them from the user
  if (status >= 500) {
    console.error(err);
    message = 'Something went wrong on the server';
  }

  res.status(status).json({ error: message });
});