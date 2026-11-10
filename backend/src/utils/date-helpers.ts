// Convierte "09:30" a minutos desde medianoche (570)
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convierte minutos desde medianoche (570) a "09:30"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Comprueba si dos rangos de tiempo [start1, end1] y [start2, end2] se solapan
export function isOverlapping(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && end1 > start2;
}

// Fecha actual "YYYY-MM-DD" en la zona horaria del salón (no en UTC del servidor)
export function fechaHoyEnZona(timeZone: string, ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(ahora);
}

// Minutos transcurridos desde medianoche en la zona horaria del salón
export function minutosAhoraEnZona(timeZone: string, ahora: Date = new Date()): number {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(ahora);
  const h = Number(partes.find(p => p.type === 'hour')?.value ?? 0) % 24;
  const m = Number(partes.find(p => p.type === 'minute')?.value ?? 0);
  return h * 60 + m;
}

// Suma días a una fecha "YYYY-MM-DD" y devuelve "YYYY-MM-DD"
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(fecha + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Convierte "YYYY-MM-DD" al Date (medianoche UTC) usado por las columnas @db.Date
export function fechaADate(fecha: string): Date {
  return new Date(fecha + 'T00:00:00.000Z');
}
