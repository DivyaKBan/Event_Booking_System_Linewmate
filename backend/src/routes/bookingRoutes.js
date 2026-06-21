const express = require('express');
const { body } = require('express-validator');
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('eventId').trim().notEmpty().withMessage('eventId is required'),
    body('seats').notEmpty().withMessage('seats is required')
      .isInt({ min: 1 }).withMessage('seats must be a positive integer'),
  ],
  validate,
  createBooking
);

router.get('/', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
