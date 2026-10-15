import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  TIMEZONE: process.env.TIMEZONE || 'America/Bogota',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_claudia_santana_nails',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SALON_PHONE_NUMBER: process.env.SALON_PHONE_NUMBER || '573184642772',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200'
};
