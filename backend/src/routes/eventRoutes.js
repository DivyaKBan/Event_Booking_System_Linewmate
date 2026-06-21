const express = require('express');
const { body } = require('express-validator');
const { getEvents, getEventById, createEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

// Bonus endpoint: lets any authenticated user create an event.
// The assessment did not specify an admin role, so this is documented
// as an assumption in the README rather than gated behind a role system.
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Event name is required')
      .isLength({ max: 150 }).withMessage('Event name must be at most 150 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
      .isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
    body('dateTime').notEmpty().withMessage('Date & time is required')
      .isISO8601().withMessage('Date & time must be a valid date'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('totalSeats').notEmpty().withMessage('Total seats is required')
      .isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  ],
  validate,
  createEvent
);

module.exports = router;
