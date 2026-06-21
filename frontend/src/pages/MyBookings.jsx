import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import { formatDateTime } from '../utils/format';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data.bookings);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setError('');
    setCancellingId(bookingId);
    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? res.data.data.booking : b)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Bookings</h1>
            <p className="page-subtitle">View and manage the events you&apos;ve booked.</p>
          </div>
        </div>

        <Alert>{error}</Alert>

        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>
              Browse <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>upcoming events</Link> and book your first seat.
            </p>
          </div>
        ) : (
          <div className="card">
            {bookings.map((booking) => (
              <div className="booking-row" key={booking._id}>
                <div className="booking-row-info">
                  <h4>{booking.event?.name || 'Event no longer available'}</h4>
                  <p>
                    {booking.event ? formatDateTime(booking.event.dateTime) : ''}
                    {booking.event ? ` · ${booking.event.venue}` : ''}
                  </p>
                  <p>{booking.seats} seat{booking.seats > 1 ? 's' : ''} booked</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                  {booking.status === 'confirmed' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
