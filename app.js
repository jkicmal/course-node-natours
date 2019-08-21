const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Define middleware app.use()
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log requests
}

// Parse body requests to json
app.use(express.json());

// This folder will contain static files like views, media etc.
app.use(express.static(`${__dirname}/public`));

// Every request will contain requested time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // run next middleware in stack
});

// Use routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// Export app to server
module.exports = app;
