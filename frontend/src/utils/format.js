export function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function seatStatus(availableSeats, totalSeats) {
  if (availableSeats <= 0) return { label: 'Sold out', tone: 'sold-out' };
  if (availableSeats / totalSeats <= 0.15) return { label: `${availableSeats} seats left`, tone: 'low' };
  return { label: `${availableSeats} seats left`, tone: '' };
}
