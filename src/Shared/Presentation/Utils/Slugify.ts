export const slugify = (text: string): string =>
{
  return text
    .toLowerCase()
    .normalize('NFD')                     // Normaliza para separar acentos
    .replace(/[\u0300-\u036f]/g, '')     // Remueve acentos
    .replace(/\s+/g, '-')                // Reemplaza espacios por guiones
    .replace(/[^\w\\-]+/g, '')            // Elimina caracteres no alfanuméricos excepto guiones
    .replace(/--+/g, '-')              // Reemplaza múltiples guiones por uno
    .replace(/^-+/, '')                  // Elimina guiones iniciales
    .replace(/-+$/, '');                 // Elimina guiones finales
}
