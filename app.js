const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

// This middleware will be executed only if any of the routes didn't catch it
// .all for all requests, '*' for all routes
app.all('*', (req, res, next) => {
  // If we pass argument into next function, express will assume that this is an error.
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// 4 arguments means that this is an error handle middleware
app.use(globalErrorHandler);

// Export app to server
module.exports = app;
