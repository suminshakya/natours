const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authenticationController');

const router = express.Router({ mergeParams: true }); //To get the parameter of another route use merge param


// POST /tour/234fgf/reviews
// POST /reviews
// All this route handle are handled by below endpoint 

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
  
module.exports = router;
