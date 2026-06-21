import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/events', {
          params: { page: pagination.page, search },
          signal: controller.signal,
        });
        setEvents(res.data.data.events);
        setPagination((prev) => ({ ...prev, ...res.data.data.pagination }));
      } catch (err) {
        if (err.name !== 'CanceledError') setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300); // debounce search input

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pagination.page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Upcoming Events</h1>
            <p className="page-subtitle">Browse events and book your seats.</p>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or venue"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Alert>{error}</Alert>

        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>Try a different search term, or check back later.</p>
          </div>
        ) : (
          <>
            <div className="event-grid">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
