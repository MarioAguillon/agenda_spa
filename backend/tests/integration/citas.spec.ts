import { describe, it, expect } from 'vitest';
import { isOverlapping, timeToMinutes } from '../../src/utils/date-helpers';

describe('Pruebas de Integración y Reglas de Negocio - Citas', () => {
  it('Debe calcular correctamente la hora de fin según la duración del servicio', () => {
    const horaInicioStr = '10:00';
    const duracionManicure = 60; // minutos
    const duracionUnas = 120; // minutos

    const inicioMin = timeToMinutes(horaInicioStr);
    const finManicureMin = inicioMin + duracionManicure;
    const finUnasMin = inicioMin + duracionUnas;

    expect(finManicureMin).toBe(660); // 11:00 AM
    expect(finUnasMin).toBe(720); // 12:00 PM
  });

  it('Debe evitar reservas que se solapen con citas activas (Doble Reserva)', () => {
    // Cita existente: 10:00 AM a 11:00 AM (600 a 660 min)
    const citaExistente = { inicio: 600, fin: 660 };

    // Intento 1: 10:30 AM a 11:30 AM (630 a 690 min) -> Debe rebotar (true)
    const intento1 = { inicio: 630, fin: 690 };
    expect(isOverlapping(intento1.inicio, intento1.fin, citaExistente.inicio, citaExistente.fin)).toBe(true);

    // Intento 2: 11:00 AM a 12:00 PM (660 a 720 min) -> Válido (false)
    const intento2 = { inicio: 660, fin: 720 };
    expect(isOverlapping(intento2.inicio, intento2.fin, citaExistente.inicio, citaExistente.fin)).toBe(false);
  });
});
