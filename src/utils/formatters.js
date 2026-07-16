export function formatNumber(value, digits = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : '0.0';
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDateTime(value) {
  if (!value) return 'Waiting for update';
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

export function secondsToClock(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
