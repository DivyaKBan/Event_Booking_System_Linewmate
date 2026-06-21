import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, seatStatus } from '../utils/format';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [seats, setSeats] = useState(1);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEvent = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.data.event);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    const numSeats = Number(seats);
    if (!Number.isInteger(numSeats) || numSeats < 1) {
      setBookingError('Please enter a valid number of seats');
      return;
    }
    if (numSeats > event.availableSeats) {
      setBookingError(`Only ${event.availableSeats} seat(s) are available`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings', { eventId: event._id, seats: numSeats });
      setBookingSuccess('Booking confirmed! View it under "My Bookings".');
      setSeats(1);
      await loadEvent(); // refresh seat availability
    } catch (err) {
      setBookingError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (loadError) {
    return (
      <div className="page">
        <div className="container">
          <Alert>{loadError}</Alert>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const status = seatStatus(event.availableSeats, event.totalSeats);
  const soldOut = event.availableSeats <= 0;

  return (
    <div className="page">
      <div className="container">
        <div className="card event-detail-card">
          <span className="ticket-eyebrow">{formatDateTime(event.dateTime)}</span>
          <h1>{event.name}</h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.6 }}>{event.description}</p>

          <div className="event-detail-meta">
            <div className="meta-item">
              <div className="meta-label">Venue</div>
              <div className="meta-value">{event.venue}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Date &amp; Time</div>
              <div className="meta-value">{formatDateTime(event.dateTime)}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Total Seats</div>
              <div className="meta-value">{event.totalSeats}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Availability</div>
              <div className="meta-value">
                <span className={`seat-pill ${status.tone}`}>{status.label}</span>
              </div>
            </div>
          </div>

          <Alert type="error">{bookingError}</Alert>
          <Alert type="success">{bookingSuccess}</Alert>

          <form onSubmit={handleBook} className="booking-box">
            <div className="field">
              <label htmlFor="seats">Seats</label>
              <input
                id="seats"
                type="number"
                min={1}
                max={event.availableSeats || 1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                disabled={soldOut}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={soldOut || submitting}>
              {soldOut ? 'Sold out' : submitting ? 'Booking…' : 'Book seats'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
