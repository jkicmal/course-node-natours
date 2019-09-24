const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review body cannot be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'You must specify tour rating']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  // Schema options object
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  }
);

// User can only post 1 review on specific tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query midddleware
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // 'this' in static functions points to a current class
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // After deleting last review
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5 // Default value
    });
  }
};

// Post middleware has no access to "next" function
reviewSchema.post('save', function() {
  // this.constructor returns instance's Model
  // so same as Review.calcAverageRatings(this.tour)
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// both are shorthand for findOne
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.tempReview = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work tere because query was already executed
  await this.tempReview.constructor.calcAverageRatings(this.tempReview.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
