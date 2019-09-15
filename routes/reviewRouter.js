const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// Access parameter from other routes (required for nester routes)
const router = express.Router({ mergeParams: true });

router.route('/:id').get(reviewController.getReview);

// Both:
// POST /reviews
// POST /tour/ID/reviews
// Are valid routes
// It works because of merged routers
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.createReview
  );

module.exports = router;
