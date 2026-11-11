/** Datos de contacto del salón: un solo lugar para cambiarlos. */
export const SALON = {
  nombre: 'Claudia Santana Nails',
  profesional: 'Claudia Santana',
  telefonoWhatsApp: '573184642772',
  telefonoVisible: '318 464 2772',
  direccion: 'Calle 21 # 2-16, Mosquera, Cundinamarca',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+21+%232-16+Mosquera+Cundinamarca',
  mapsEmbed: 'https://www.google.com/maps?q=Calle+21+%232-16,+Mosquera,+Cundinamarca&output=embed',
  zonaHoraria: 'America/Bogota'
};

export function whatsappUrl(mensaje?: string): string {
  const base = `https://wa.me/${SALON.telefonoWhatsApp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
