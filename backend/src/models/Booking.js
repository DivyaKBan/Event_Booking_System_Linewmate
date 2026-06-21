const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'At least 1 seat must be booked'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
