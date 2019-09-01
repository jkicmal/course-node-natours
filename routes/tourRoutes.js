const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

// Pre defined route, it adds query to url
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// Get tours stats using aggregation
router.route('/tour-stats').get(tourController.getTourStats);

// Get monthly tour plan using aggregation
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  // on this route
  .route('/')
  // use this controllers
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// export router for express app to use it
module.exports = router;
