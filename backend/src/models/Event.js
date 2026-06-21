const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: 2000,
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date & time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      maxlength: 200,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
  },
  { timestamps: true }
);

// Helpful for sorting upcoming events and filtering
eventSchema.index({ dateTime: 1 });

module.exports = mongoose.model('Event', eventSchema);
