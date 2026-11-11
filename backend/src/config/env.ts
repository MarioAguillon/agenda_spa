import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * JWT_SECRET es obligatorio en producción (mínimo 32 caracteres).
 * En desarrollo/test, si falta, se genera uno aleatorio por proceso
 * (las sesiones se invalidan al reiniciar, lo cual es aceptable en local).
 */
function resolverJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32 && !secret.startsWith('CAMBIAR')) return secret;

  if (IS_PRODUCTION) {
    throw new Error('[ENV] JWT_SECRET falta o es inseguro (mínimo 32 caracteres aleatorios). El servidor no puede iniciar.');
  }
  console.warn('[ENV] JWT_SECRET no configurado o débil: usando un secreto aleatorio temporal (solo desarrollo).');
  return crypto.randomBytes(48).toString('hex');
}

export const ENV = {
  NODE_ENV,
  IS_PRODUCTION,
  PORT: parseInt(process.env.PORT || '3000', 10),
  TIMEZONE: process.env.TIMEZONE || 'America/Bogota',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: resolverJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  SALON_PHONE_NUMBER: process.env.SALON_PHONE_NUMBER || '573184642772',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',
  /** Orígenes permitidos por CORS. CLIENT_URL acepta varios separados por coma. */
  CLIENT_URLS: (process.env.CLIENT_URL || 'http://localhost:4200')
    .split(',')
    .map(u => u.trim().replace(/\/$/, ''))
    .filter(Boolean),
  /** Cuántos días hacia adelante se permite reservar online */
  MAX_DIAS_ANTICIPACION: parseInt(process.env.MAX_DIAS_ANTICIPACION || '90', 10)
};
