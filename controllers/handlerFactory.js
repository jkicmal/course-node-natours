const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // If not found - add new
      runValidators: true // Validate data
    });

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // Create document using requested data
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDocument
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    // If there is no tour but id is correct
    if (!document) {
      // We have to return to not let rest of the code exectue
      return next(new AppError('No document found with that ID.', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET revicews on tour (hack)
    let filter = {};
    // Thanks to merging params in routers
    // we can access tour id on specific path
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Generate query based on request params
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Run created query
    // .explain() to return more information
    // const document = await features.query.explain();
    const document = await features.query;

    res.status(201).json({
      status: 'success',
      results: document.length,
      data: {
        data: document
      }
    });
  });
