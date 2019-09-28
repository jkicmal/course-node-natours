const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    // Schema definition
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      // This is a validator, if requirement is not met it returs an error
      // String validators
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [5, 'A tour name must have more than 5 characters']
      // Commented because spaces don't count as characters
      // validate: [validator.isAlpha, 'Tour name must only contain characters.']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      // String validator
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // Number validators
      min: [1, 'Rating must be above 1.0'], // Also works for dates
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      // To access 'price' on 'this' model we have to use normal function
      // Val is 'priceDiscount'
      validate: {
        validator: function(val) {
          return val < this.price; // this won't work in update
        },
        // Mongoose specific access to current value
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      // Required for geo json data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      // We expect array of numbers (lon, lat)
      // Required for geo json data
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // Points to other document
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  // Schema options object
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  }
);

// 1 order ASC, -1 order DESC
// tourSchema.index({ price: 1 });
// Compound index
// We should index only indexes that are most queried
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
// This location is indexed to 2dsphere
tourSchema.index({ startLocation: '2dsphere' });

// Define virtual property (does not exist in db, derived from existing data)
// Has to be a regular function because we need 'this' keyword
// Virtual properties cannot be used in queries
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Allow access to reviews through tour
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});

// Document middleware
// Runs before .save() and .create()
// 'save' is a 'hook'
tourSchema.pre('save', function(next) {
  // Slug property must be defined on schema
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   // Find user for every specified id
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   // Guides is now Array of users with previously found ids
//   // Embedding example
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware
// Works only for .find(), not .findOne()
// /^find/ - all strings starting with 'find'
tourSchema.pre(/^find/, function(next) {
  // 'this' keyword points to query
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now(); // Remember that query is just a normal object

  next();
});

// Fill up guides field with actual data
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds.`);
  // console.log(docs);
  next();
});

// Aggregation middleware
// 'this' points to the current aggregation
// tourSchema.pre('aggregate', function(next) {
//   // Add another $match at the end of pipeline array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
