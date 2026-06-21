// Populates the database with a handful of sample events so the app is
// usable immediately after setup. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Event = require('./models/Event');

const sampleEvents = [
  {
    name: 'Tech Conclave 2026',
    description: 'A full-day conference featuring talks on AI, cloud computing, and the future of software engineering, with speakers from leading tech companies.',
    dateTime: new Date('2026-08-15T10:00:00+05:30'),
    venue: 'Bhopal Convention Centre, Bhopal',
    totalSeats: 200,
    availableSeats: 200,
  },
  {
    name: 'Indie Music Night',
    description: 'An evening of live performances by independent musicians and bands, spanning genres from folk to electronic.',
    dateTime: new Date('2026-07-20T19:00:00+05:30'),
    venue: 'Open Air Amphitheatre, Indore',
    totalSeats: 150,
    availableSeats: 150,
  },
  {
    name: 'Startup Pitch Fest',
    description: 'Early-stage startups pitch their ideas to a panel of investors and mentors, followed by networking sessions.',
    dateTime: new Date('2026-09-05T09:30:00+05:30'),
    venue: 'Innovation Hub, Pune',
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    name: 'Classical Dance Recital',
    description: 'An evening showcasing classical Indian dance forms including Bharatanatyam and Kathak by award-winning performers.',
    dateTime: new Date('2026-07-30T18:30:00+05:30'),
    venue: 'Ravindra Bhavan, Bhopal',
    totalSeats: 80,
    availableSeats: 80,
  },
  {
    name: 'Hackathon: Build for Bharat',
    description: 'A 24-hour hackathon inviting developers to build solutions for real-world problems faced by Indian communities.',
    dateTime: new Date('2026-08-22T08:00:00+05:30'),
    venue: 'NIT Campus, Bhopal',
    totalSeats: 120,
    availableSeats: 120,
  },
];

const seed = async () => {
  try {
    await connectDB();
    await Event.deleteMany({});
    await Event.insertMany(sampleEvents);
    console.log(`Seeded ${sampleEvents.length} events successfully`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
