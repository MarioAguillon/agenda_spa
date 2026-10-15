import { describe, it, expect } from 'vitest';
import { timeToMinutes, minutesToTime, isOverlapping } from '../../src/utils/date-helpers';

describe('Motor de Disponibilidad - Helpers de Tiempo', () => {
  it('Debe convertir cadenas de hora "HH:mm" a minutos correctamente', () => {
    expect(timeToMinutes('09:00')).toBe(540);
    expect(timeToMinutes('10:30')).toBe(630);
    expect(timeToMinutes('18:00')).toBe(1080);
  });

  it('Debe convertir minutos desde medianoche a formato "HH:mm"', () => {
    expect(minutesToTime(540)).toBe('09:00');
    expect(minutesToTime(630)).toBe('10:30');
    expect(minutesToTime(1080)).toBe('18:00');
  });

  it('Debe detectar solapamientos entre rangos de tiempo', () => {
    // Caso 1: Solapamiento parcial (10:00 - 11:00 choca con 10:30 - 11:30)
    expect(isOverlapping(600, 660, 630, 690)).toBe(true);

    // Caso 2: Solapamiento exacto (10:00 - 11:00 choca con 10:00 - 11:00)
    expect(isOverlapping(600, 660, 600, 660)).toBe(true);

    // Caso 3: Secuenciales sin solapamiento (09:00 - 10:00 y 10:00 - 11:00)
    expect(isOverlapping(540, 600, 600, 660)).toBe(false);

    // Caso 4: Completamente independientes (09:00 - 10:00 y 14:00 - 15:00)
    expect(isOverlapping(540, 600, 840, 900)).toBe(false);
  });
});
