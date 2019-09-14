const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Global middlewares
// Define middleware app.use()
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log requests
}

// Set security for HTTP headers
app.use(helmet());

// Limit number of requests for same ip
const limiter = rateLimit({
  max: 100, // 100 requests...
  windowMs: 60 * 60 * 1000, // ... per 1 hour
  message: 'Too many requests from this IP, please try again in an hour.'
});
app.use('/api', limiter);

// Parse body requests to json
// Limit body size to 10kb
app.use(express.json({ lmit: '10kb' }));

// Data sanitization against NoSQL query injection
// It removes $ and . signs from request body
app.use(mongoSanitize());

// Data sanitization against XSS attacks
// Converts html signs to html entities eg. < is &lt
app.use(xss());

// Prevent parameter pollution
// Only use last parameter
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// This folder will contain static files like views, media etc.
app.use(express.static(`${__dirname}/public`));

// Test middleware
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
