const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// Generic functions
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
  // If no tour tourId specified, get it from current route
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // If no userId specified, get it from currently logged user
  if (!req.body.user) req.body.user = req.user.id;

  next();
};
