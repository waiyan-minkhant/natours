const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// Start express app
const app = express();

// so that req.secure will work
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Allow specific origins (websites )
// api.natours.com frontend natours.com
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );

// Access-Control-Allow-Origin * (only for simple (get, post) requests not for non-simple reqs(put, patch, delete) or reqs that send cookies or use non-standard headers. These non-simple reqs require preflight phase. Before non-simple req happens, the browser first does an option req in order to figure out the actual req is safe to send. For us devs, on our server, we need to respond to that options req, which is just another HTTP method. So basically when we get one of these options reqs on our server, we then need to send back the same Access-Control-Allow-Origin header so that the browser will then know the actual req is safe to perform and then executes that non-simple req)
// app.options('*', cors());
// Only tour routes will be able to use put, patch, and delete from a cross-origin-request
app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// to parse data coming from URL encoded form (action and method in form)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// set headers for Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.5/axios.min.js https://js.stripe.com;"
  );
  //   res.setHeader(
  //     'Content-Security-Policy',
  //     "script-src 'self' https://unpkg.com; style-src 'self' https://unpkg.com;"
  //   );
  next();
});

// to compress texts (won't work for imgs like JPEGs as they're already compressed)
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
