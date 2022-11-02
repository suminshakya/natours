const express = require('express');
const bookingController = require('../controller/bookingController');
const authController = require('../controller/authenticationController'); 

const router = express.Router();

router.use(authController.protect);
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .patch(bookingController.updateBooking)
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;