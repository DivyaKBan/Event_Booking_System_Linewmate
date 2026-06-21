const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Book seats for an event
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { eventId, seats } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, 'Invalid event id');
  }

  const numSeats = Number(seats);
  if (!Number.isInteger(numSeats) || numSeats < 1) {
    throw new ApiError(400, 'Seats must be a positive integer');
  }

  // Atomically decrement availableSeats only if enough seats remain.
  // This single conditional update avoids the read-then-write race
  // condition that could otherwise let two concurrent requests both
  // pass a seat check and overbook the event.
  const event = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gte: numSeats } },
    { $inc: { availableSeats: -numSeats } },
    { new: true }
  );

  if (!event) {
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      throw new ApiError(404, 'Event not found');
    }
    throw new ApiError(
      400,
      `Only ${existingEvent.availableSeats} seat(s) available for this event`
    );
  }

  let booking;
  try {
    booking = await Booking.create({
      user: req.user._id,
      event: event._id,
      seats: numSeats,
      status: 'confirmed',
    });
  } catch (err) {
    // Roll back the seat deduction if booking creation fails for any reason
    await Event.updateOne({ _id: event._id }, { $inc: { availableSeats: numSeats } });
    throw err;
  }

  await booking.populate('event');

  res.status(201).json({
    success: true,
    message: 'Booking confirmed',
    data: { booking },
  });
});

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('event')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { bookings },
  });
});

// @desc    Cancel a booking and release seats back to the event
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not allowed to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'This booking has already been cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  // Release the seats back to the event's inventory
  await Event.updateOne({ _id: booking.event }, { $inc: { availableSeats: booking.seats } });

  await booking.populate('event');

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking },
  });
});

module.exports = { createBooking, getMyBookings, cancelBooking };
