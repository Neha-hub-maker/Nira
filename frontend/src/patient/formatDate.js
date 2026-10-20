const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

export function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
