# Eventify — Event Booking System

A full-stack event booking application built for the Linemate Full Stack Developer Internship assessment. Users can register, browse events, book seats, and manage their bookings, with seat inventory kept consistent even under concurrent bookings.

**Tech stack:** React (Vite) · Node.js · Express.js · MongoDB (Mongoose) · JWT authentication

---

## Table of contents

- [Project structure](#project-structure)
- [Project setup](#project-setup)
- [Environment variables](#environment-variables)
- [API documentation](#api-documentation)
- [Assumptions](#assumptions)
- [Design decisions](#design-decisions)
- [Possible future enhancements](#possible-future-enhancements)

---

## Project structure

```
event-booking-system/
├── backend/                 # Express REST API
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/                # Mongoose schemas (User, Event, Booking)
│   │   ├── controllers/           # Route handlers / business logic
│   │   ├── routes/                # Express routers + input validation
│   │   ├── middleware/            # Auth guard, validation, error handler
│   │   ├── utils/                 # ApiError, asyncHandler, JWT helper
│   │   ├── seed.js                # Seeds sample events
│   │   ├── app.js                 # Express app (middleware + routes)
│   │   └── server.js              # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/                # React (Vite) SPA
    ├── src/
    │   ├── api/                   # Axios instance + error helper
    │   ├── context/AuthContext.jsx
    │   ├── components/            # Navbar, EventCard, ProtectedRoute, etc.
    │   ├── pages/                 # Login, Register, Events, EventDetails, MyBookings
    │   └── utils/format.js
    ├── .env.example
    └── package.json
```

## Project setup

### Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd event-booking-system
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # optional: populates 5 sample events
npm run dev                # starts the API on http://localhost:5000
```

### 3. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env     # defaults already point to http://localhost:5000/api
npm install
npm run dev                # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser. Register a new account, then browse and book events.

### Production builds

- Backend: `npm start` (after setting `NODE_ENV=production` and a real `MONGO_URI`/`JWT_SECRET`)
- Frontend: `npm run build` produces a static `dist/` folder you can serve with any static host (Vercel, Netlify, Nginx, etc.), pointing `VITE_API_URL` at your deployed backend.

---

## Environment variables

### Backend (`backend/.env`)

| Variable          | Description                                              | Example                                          |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| `PORT`            | Port the Express server listens on                          | `5000`                                              |
| `NODE_ENV`        | `development` or `production`                                | `development`                                       |
| `MONGO_URI`       | MongoDB connection string                                    | `mongodb://127.0.0.1:27017/event-booking`           |
| `JWT_SECRET`      | Secret used to sign JWTs — use a long random string in prod  | `super-secret-key`                                  |
| `JWT_EXPIRES_IN`  | Token lifetime                                                | `7d`                                                |
| `CLIENT_URL`      | Frontend origin, used for CORS                                | `http://localhost:5173`                             |

### Frontend (`frontend/.env`)

| Variable        | Description                  | Example                          |
| --------------- | ----------------------------- | ----------------------------------- |
| `VITE_API_URL`  | Base URL of the backend API     | `http://localhost:5000/api`          |

---

## API documentation

All responses follow a consistent envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "...", "errors": ["..."] }
```

Authenticated routes require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint              | Auth | Description                  |
| ------ | ---------------------- | ---- | ------------------------------ |
| POST   | `/api/auth/register`   | No   | Register a new user             |
| POST   | `/api/auth/login`      | No   | Log in and receive a JWT        |
| POST   | `/api/auth/logout`     | Yes  | Logout (see assumption below)   |
| GET    | `/api/auth/me`         | Yes  | Get the current user's profile  |

**POST `/api/auth/register`**
```json
// Request
{ "name": "Asha Rao", "email": "asha@example.com", "password": "secret123" }

// 201 Response
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "_id": "...", "name": "Asha Rao", "email": "asha@example.com" },
    "token": "eyJhbGciOi..."
  }
}
```

**POST `/api/auth/login`**
```json
// Request
{ "email": "asha@example.com", "password": "secret123" }
// 200 Response: same shape as register
```

### Events

| Method | Endpoint           | Auth | Description                                       |
| ------ | -------------------- | ---- | ---------------------------------------------------- |
| GET    | `/api/events`         | No   | List events (supports `page`, `limit`, `search`)        |
| GET    | `/api/events/:id`     | No   | Get a single event's details                           |
| POST   | `/api/events`         | Yes  | Create an event (bonus endpoint, see assumptions)        |

**GET `/api/events?page=1&limit=12&search=music`**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "665f1...",
        "name": "Indie Music Night",
        "description": "...",
        "dateTime": "2026-07-20T13:30:00.000Z",
        "venue": "Open Air Amphitheatre, Indore",
        "totalSeats": 150,
        "availableSeats": 132
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 5, "totalPages": 1 }
  }
}
```

### Bookings (all require authentication)

| Method | Endpoint                  | Description                                  |
| ------ | --------------------------- | ----------------------------------------------- |
| POST   | `/api/bookings`              | Book seats for an event                         |
| GET    | `/api/bookings`              | List the logged-in user's bookings              |
| PATCH  | `/api/bookings/:id/cancel`   | Cancel a booking and release the seats          |

**POST `/api/bookings`**
```json
// Request
{ "eventId": "665f1...", "seats": 2 }

// 201 Response
{
  "success": true,
  "message": "Booking confirmed",
  "data": { "booking": { "_id": "...", "seats": 2, "status": "confirmed", "event": { ... } } }
}

// 400 Response if not enough seats remain
{ "success": false, "message": "Only 1 seat(s) available for this event" }
```

**PATCH `/api/bookings/:id/cancel`**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": { "booking": { "_id": "...", "status": "cancelled", "...": "..." } }
}
```

### Error responses

| Status | Meaning                                                |
| ------ | --------------------------------------------------------- |
| 400    | Validation failure / bad request (e.g. not enough seats)    |
| 401    | Missing/invalid/expired token                                |
| 403    | Authenticated but not allowed (e.g. cancelling another user's booking) |
| 404    | Resource not found                                          |
| 409    | Conflict (e.g. email already registered)                      |
| 500    | Unexpected server error                                      |

---

## Assumptions

- **No admin role.** The assessment didn't specify an admin/staff role, so `POST /api/events` is open to any authenticated user. This keeps the system self-contained and testable without seeding data through the database directly, while the README documents it as a deliberate simplification rather than a production-ready access model.
- **Stateless JWT "logout".** Since the app doesn't maintain server-side sessions, `POST /api/auth/logout` is a symmetry/cleanup endpoint; the actual logout happens client-side by discarding the stored token. A production system needing immediate token revocation would add a token blacklist or move to short-lived access tokens with refresh tokens.
- **One "ticket type" per event.** Seats are undifferentiated (no seat numbers or pricing tiers) — a booking simply reserves a quantity of seats from a single shared pool, matching the assessment's "Total Seats / Available Seats" model.
- **Booking ownership.** Users can only view and cancel their own bookings; there's no organizer-facing dashboard to view all bookings for an event.
- **Cancellation policy.** Bookings can be cancelled at any time before the event (no cutoff window), and a cancelled booking's seats are released immediately.
- **Email is the unique identifier** for accounts; there's no email verification step, which would normally be added before production use.

## Design decisions

- **Why MongoDB/Mongoose:** the data model (events, bookings, users) is simple and document-shaped with no complex joins, so MongoDB keeps the data layer lightweight. The same domain logic would map cleanly onto PostgreSQL/MySQL with a relational schema if preferred.
- **Preventing overbooking under concurrency.** Rather than reading `availableSeats`, checking it in application code, then writing — which has a race condition if two requests book the last seats at the same time — booking uses a single atomic MongoDB operation: `findOneAndUpdate({ _id, availableSeats: { $gte: seats } }, { $inc: { availableSeats: -seats } })`. The conditional filter and the decrement happen as one atomic operation at the database level, so two concurrent requests can never both succeed when only one has enough seats. Cancellation symmetrically increments `availableSeats` back.
- **Centralized error handling.** All controllers throw a small `ApiError(statusCode, message)` and let Express's error-handling middleware format the response. Combined with an `asyncHandler` wrapper, this avoids repetitive try/catch blocks and keeps error responses consistent across the API.
- **Input validation at the edge.** `express-validator` validates and sanitizes request bodies in the route layer before any controller or database logic runs, so bad input never reaches business logic.
- **JWT in a Bearer header (not cookies).** Keeps the API stateless and trivially usable from any client (web, mobile, Postman) without CORS/cookie complications, at the cost of the frontend needing to store the token (here, in `localStorage`) and attach it manually — a reasonable tradeoff for an assessment-scoped SPA.
- **Frontend architecture.** A single `AuthContext` exposes `user`, `login`, `register`, and `logout` to the whole tree; an Axios instance centralizes the base URL, attaches the token to every request, and clears local auth state on a 401 response. Pages fetch their own data with local component state rather than a global store, since the data needs (events list, one event, my bookings) don't overlap enough to justify shared client-side cache/state management for an app this size.
- **UX details:** seat booking is blocked client-side once seats hit 0, with a live "seats left" indicator that also flags low availability; the search box debounces network requests; cancelling a booking updates the row in place rather than refetching the whole list.

## Possible future enhancements

- Role-based access control (organizer vs attendee) instead of the current "any logged-in user can create events" assumption
- Email confirmation for bookings and password reset flow
- Server-side pagination/cancellation cutoff windows and waitlists for sold-out events
- Automated test suite (Jest/Supertest for the API, React Testing Library for the frontend)
- Dockerized setup (`docker-compose`) for one-command local startup including MongoDB
