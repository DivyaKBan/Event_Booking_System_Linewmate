import { Link } from 'react-router-dom';
import { formatDateTime, seatStatus } from '../utils/format';

export default function EventCard({ event }) {
  const status = seatStatus(event.availableSeats, event.totalSeats);

  return (
    <Link to={`/events/${event._id}`} className="ticket-card">
      <span className="ticket-eyebrow">{formatDateTime(event.dateTime)}</span>
      <h3>{event.name}</h3>
      <div className="ticket-meta">
        <span>{event.venue}</span>
      </div>
      <div className="ticket-divider" />
      <div className="ticket-footer">
        <span className={`seat-pill ${status.tone}`}>{status.label}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
          of {event.totalSeats} seats
        </span>
      </div>
    </Link>
  );
}
