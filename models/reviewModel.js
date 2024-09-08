// review / rating / created at / ref to tour / ref to user

const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to the tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to the user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound Index
// reviews cannot be duplicate, same user cannot give the same tour the same review twice
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.select('-__v')
  //   .populate({
  //     path: 'tour',
  //     select: 'name',
  //   })
  //   .populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// To be called on Model
// We made this a statics method because we need to call this.aggregate() on the Model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log(tourId);
  // this points to model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0)
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  else
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
};

// use post because if used pre, the current document (review) won't be in the collection yet
reviewSchema.post('save', function () {
  // this points to the current document (review) being saved
  // this.constructor is the Model as we can't access Review Model directly
  // this.tour means the tour field of the currrent document (review) that is being saved
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Access the document from the query middleware like this
  // We can't use post because it would be when the query has already been executed.
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // We cannot call .calcAverageRatings() in pre query middleware because the review is still not an updated data
  // passing the review from pre to post query middleware (by adding property to this)
  // this.findOne() doesn't work here as the query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
