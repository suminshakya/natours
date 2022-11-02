const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have name'],
      trim: true,
      minlength: [10, 'The tour name must have min length'],
      maxlength: [40, 'The tour name must have min length'],
      ///  validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy , medium , difficulty',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.7,
      min: [1, 'Rating must be greater than 1'],
      max: [5, 'Rating should be less than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only point for the current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below than regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        date: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
     
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // need to implement in geo sphere

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populates
tourSchema.virtual('reviews',{
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (el) => await User.findById(el));
  this.guides = await Promise.all(guidesPromises);
  next();
});

tourSchema.pre('save', (next) => {
  console.log('Will be saved');
  next();
});

tourSchema.post('save', (doc, next) => {
  console.log('post',doc);
  next();
})

// QUERY MIDDLEWARE which returns query obj
//tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});




// AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
