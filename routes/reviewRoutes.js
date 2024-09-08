const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

const { getAllReviews, createReview, deleteReview, updateReview, getReview } =
  reviewController;

router.use(authController.protect);

router
  .route('/')
  .get(getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    createReview
  );

router
  .route('/:id')
  .get(getReview)
  .patch(authController.restrictTo('admin', 'user'), updateReview)
  .delete(authController.restrictTo('admin', 'user'), deleteReview);

module.exports = router;
