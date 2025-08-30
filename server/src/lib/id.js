export function generateBookingId() {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `EH-${ts}-${rnd}`
}
