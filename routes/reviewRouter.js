const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// Access parameter from other routes (required for nester routes)
const router = express.Router({ mergeParams: true });

router.route('/:id').get(reviewController.getReview);

// Both are valid:
// POST /reviews
// POST /tour/ID/reviews
// It works because of merged routers
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
