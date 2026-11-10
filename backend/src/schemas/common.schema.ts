import { z } from 'zod';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Fecha "YYYY-MM-DD" que además sea un día real del calendario (rechaza 2026-02-31). */
export const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD')
  .refine((v) => {
    const d = new Date(v + 'T00:00:00.000Z');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'La fecha no existe en el calendario');

export const horaSchema = z.string().regex(HORA_REGEX, 'Formato de hora debe ser HH:mm');

export const uuidSchema = z.string().uuid('ID no válido');

export const nombreSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(80, 'El nombre no puede superar 80 caracteres');

/**
 * Teléfono: acepta "+57 300 123 4567", "300-123-4567", etc.
 * Se normaliza a solo dígitos y, si es un celular colombiano con indicativo 57,
 * se guarda sin el indicativo (10 dígitos) para evitar clientas duplicadas.
 */
export const telefonoSchema = z
  .string()
  .trim()
  .max(20, 'Teléfono demasiado largo')
  .regex(/^\+?[\d\s().-]+$/, 'El teléfono solo puede contener números')
  .transform((v) => {
    const digitos = v.replace(/\D/g, '');
    return digitos.length === 12 && digitos.startsWith('573') ? digitos.slice(2) : digitos;
  })
  .refine((v) => v.length >= 7 && v.length <= 12, 'El teléfono debe tener entre 7 y 12 dígitos');

export const emailOpcionalSchema = z
  .string()
  .trim()
  .max(120)
  .email('Email no válido')
  .optional()
  .or(z.literal(''));

export const notasSchema = z.string().trim().max(500, 'Las notas no pueden superar 500 caracteres').optional();

export const servicioIdsSchema = z
  .array(uuidSchema)
  .min(1, 'Debe seleccionar al menos un servicio')
  .max(10, 'Máximo 10 servicios por cita');
