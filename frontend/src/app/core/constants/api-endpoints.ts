export const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`
  },
  SERVICIOS: `${API_BASE_URL}/servicios`,
  DISPONIBILIDAD: `${API_BASE_URL}/disponibilidad`,
  CITAS: {
    BASE: `${API_BASE_URL}/citas`,
    MANUAL: `${API_BASE_URL}/citas/manual`
  },
  CLIENTES: `${API_BASE_URL}/clientes`,
  HORARIOS: `${API_BASE_URL}/horarios`,
  BLOQUEOS: `${API_BASE_URL}/bloqueos`,
  DASHBOARD: `${API_BASE_URL}/dashboard/resumen`
};
