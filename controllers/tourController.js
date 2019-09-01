const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
  // Generate query based on request params
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Run created query
  const tours = await features.query;

  res.status(201).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  // If there is no tour but id is correct
  if (!tour) {
    // We have to return to not let rest of the code exectue
    console.log(tour);
    return next(new AppError('No tour found with that ID.', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // Create document using requested data
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });

  res.status(201).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // Find document with given id and delete it
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (tour == null) {
    throw Error('No tour');
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add parameters to a request before running getTour
exports.aliasTopTours = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});

// Aggregation example
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, // Add 1 for every tour
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: {
        avgPrice: 1 // Use same column names as in group, 1 means ascending
      }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' // Make different document for every element in this array
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // Extract month from the field
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' } // Create array with tour names
      }
    },
    {
      $addFields: { month: '$_id' } // Add new field with same value as _id
    },
    {
      // Hide or show fields
      $project: {
        _id: 0 // 0 means 'hide'
      }
    },
    {
      $sort: { numToursStarts: -1 }
    },
    {
      $limit: 12 // Limit output to 12 results
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
