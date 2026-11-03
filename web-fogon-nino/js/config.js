// ============================================================
// CONFIGURACIÓN DEL SITIO — "El Fogón de Don Nino"
// Caso ficticio: los datos de contacto marcados "EJEMPLO" son
// inventados (no llevan a un contacto real). Para usar la web con
// un negocio real, reemplazarlos acá. Nada más en el sitio necesita
// tocarse para actualizar estos datos.
// ============================================================

const SITE_CONFIG = {
  // --- Identidad ---
  nombre: "El Fogón de Don Nino",
  barrio: "Villa Urquiza, CABA",

  // Dirección inventada para el caso (la consigna no pide una real).
  direccion: "Av. Triunvirato 4324, Villa Urquiza, CABA",

  // EJEMPLO: número inventado, formato internacional sin espacios (ej: 5491122223333)
  whatsappNumero: "5490000000000",
  // Mensaje precargado del botón de WhatsApp
  whatsappMensaje: "¡Hola! Quiero hacer una consulta / reserva en El Fogón de Don Nino.",

  // EJEMPLO: teléfono inventado
  telefono: "+54 11 0000-0000",
  telefonoLinkTel: "+541100000000", // mismo número, formato para el link tel:

  // EJEMPLO: link neutro a instagram.com para no apuntar a un perfil que
  // podría ser de un tercero; el usuario mostrado es inventado.
  instagramUsuario: "@elfogon_ejemplo",
  instagramUrl: "https://instagram.com",

  // Fecha que se muestra en la carta ("Precios actualizados el ...").
  // Es el respaldo: si la planilla tiene una columna "Actualizado",
  // se usa el valor de esa columna (así Facu no toca el código).
  preciosActualizados: "3 de noviembre de 2026",

  horarios: [
    { dias: "Martes a Domingo", turnos: "Mediodía y noche" },
    { dias: "Lunes", turnos: "Cerrado" },
  ],

  mapsEmbedSrc:
    "https://maps.google.com/maps?q=" +
    encodeURIComponent("Av. Triunvirato 4324, Villa Urquiza, Buenos Aires, Argentina") +
    "&z=16&output=embed",

  // EJEMPLO: apunta a la home de PedidosYa (no se sabe qué app usan).
  delivery: {
    disponible: true,
    nombreApp: "PedidosYa",
    url: "https://www.pedidosya.com.ar",
  },

  // --- Menú ---
  // URL del CSV publicado de la Google Sheet del menú
  // (Archivo > Compartir > Publicar en la web > CSV)
  menuCsvUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBFeTSxrFl9OuvXCe7RpnqVv6IKHdYdKX4BrjNG0-kMj75fP9-zH-iHO5eQqCAnz4xXPX28_hBVNIk/pub?gid=89984995&single=true&output=csv",

  // Mapa de fotos locales por nombre de plato (normalizado: minúsculas y
  // sin espacios extra). Se usa como respaldo mientras la columna
  // "URL Foto" de la planilla esté vacía. Cuando Facu cargue una URL en
  // esa columna, esa URL tiene prioridad sobre este mapa.
  fotoPorPlato: {
    "empanadas criollas (x3)": "images/empanadas.webp",
    "milanesa a la napolitana (para compartir)": "images/milanesa-napolitana.webp",
    "parrillada el fogón (para compartir)": "images/parrillada-completa.jpg",
    "tallarines con tuco de la casa": "images/tallarines-tuco.jpg",
    "flan de don nino": "images/flan-don-nino.jpg",
    // Fotos para que las categorías sin plato con foto también la tengan en la portada.
    "ensalada de la casa": "images/ensalada.jpg",
    "limonada casera": "images/bebida-sin-alcohol.jpg",
    "cerveza artesanal": "images/bebida-con-alcohol.jpg",
  },

  // Distintivo corto que se muestra junto al nombre del plato en la
  // carta (no en la tira de la portada) para los platos destacados.
  // Mismo criterio de clave que fotoPorPlato: nombre normalizado.
  badgePorPlato: {
    "empanadas criollas (x3)": "El clásico de entrada",
    "milanesa a la napolitana (para compartir)": "La preferida del barrio",
    "parrillada el fogón (para compartir)": "La estrella de las brasas",
    "tallarines con tuco de la casa": "Sabor de toda la vida",
    "flan de don nino": "El orgullo de la casa",
  },
};
