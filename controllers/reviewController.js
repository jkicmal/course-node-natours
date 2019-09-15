const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Generic functions
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  // Thanks to merging params in routers
  // we can access tour id on specific path
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(201).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.setTourUserIds = (req, res, next) => {
  // If no tour tourId specified, get it from current route
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // If no userId specified, get it from currently logged user
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});
