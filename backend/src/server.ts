import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

app.listen(ENV.PORT, () => {
  console.log(`=================================================`);
  console.log(`💅 CLAUDIA SANTANA NAILS - BACKEND API SERVER`);
  console.log(`🚀 Puerto: ${ENV.PORT}`);
  console.log(`🌍 Entorno: ${ENV.NODE_ENV}`);
  console.log(`⏰ Zona Horaria: ${ENV.TIMEZONE}`);
  console.log(`=================================================`);
});
