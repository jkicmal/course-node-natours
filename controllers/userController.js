const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const factory = require('./handlerFactory');

// Generic functions
exports.deleteUser = factory.deleteOne(User);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // Loop through every property in an object
  Object.keys(obj).forEach(el => {
    // If property is inside allowed fields array
    // add copy current property to new object
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(201).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'You cannot update password using this route. Please use /updateMyPassword'
      )
    );

  // 2) Filter out unwanted body properties
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // Reutrn updated object instead of old one
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
});
exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
});
