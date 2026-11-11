const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "YYYY-MM-DD" de una fecha local (sin pasar por UTC). */
export function aFechaISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Date local a partir de "YYYY-MM-DD". */
export function desdeFechaISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nombreDia(d: Date): string { return DIAS[d.getDay()]; }
export function nombreDiaCorto(d: Date): string { return DIAS_CORTOS[d.getDay()]; }
export function nombreMes(d: Date): string { return MESES[d.getMonth()]; }

/** "jueves 12 de noviembre" */
export function fechaLarga(iso: string): string {
  const d = desdeFechaISO(iso);
  return `${nombreDia(d)} ${d.getDate()} de ${nombreMes(d)}`;
}

/** "14:30" → "2:30 p. m." */
export function hora12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

/** 135 → "2 h 15 min" */
export function duracionTexto(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

export function sumarMinutos(hhmm: string, minutos: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
