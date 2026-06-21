const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all events (supports basic pagination & search)
// @route   GET /api/events?page=1&limit=10&search=music
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const search = (req.query.search || '').trim();

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ dateTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

// @desc    Get a single event by id
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  res.status(200).json({
    success: true,
    data: { event },
  });
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (any authenticated user, for demo/admin purposes)
const createEvent = asyncHandler(async (req, res) => {
  const { name, description, dateTime, venue, totalSeats } = req.body;

  const event = await Event.create({
    name,
    description,
    dateTime,
    venue,
    totalSeats,
    availableSeats: totalSeats,
  });

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event },
  });
});

module.exports = { getEvents, getEventById, createEvent };
