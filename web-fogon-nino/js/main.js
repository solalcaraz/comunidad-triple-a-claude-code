// ============================================================
// INIT — arranca navegación, carga el menú y completa todos los
// datos de contacto/horarios a partir de SITE_CONFIG.
// ============================================================

function pintarContacto() {
  const waHref = `https://wa.me/${SITE_CONFIG.whatsappNumero}?text=${encodeURIComponent(
    SITE_CONFIG.whatsappMensaje
  )}`;
  document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
    el.href = waHref;
  });

  const telHref = `tel:${SITE_CONFIG.telefonoLinkTel}`;
  document.querySelectorAll("[data-tel-link]").forEach((el) => {
    el.href = telHref;
  });
  document.querySelectorAll("[data-tel-texto]").forEach((el) => {
    el.textContent = SITE_CONFIG.telefono;
  });

  document.querySelectorAll("[data-instagram-link]").forEach((el) => {
    el.href = SITE_CONFIG.instagramUrl;
  });
  document.querySelectorAll("[data-instagram-texto]").forEach((el) => {
    el.textContent = SITE_CONFIG.instagramUsuario;
  });

  document.querySelectorAll("[data-direccion-texto]").forEach((el) => {
    el.textContent = SITE_CONFIG.direccion;
  });

  const mapsFrame = document.getElementById("maps-iframe");
  if (mapsFrame) mapsFrame.src = SITE_CONFIG.mapsEmbedSrc;

  const horariosCont = document.getElementById("horarios-lista");
  if (horariosCont) {
    horariosCont.innerHTML = SITE_CONFIG.horarios
      .map((h) => `<li><span class="horario-dias">${h.dias}</span><span class="horario-turnos">${h.turnos}</span></li>`)
      .join("");
  }

  const deliveryCont = document.getElementById("delivery-info");
  if (deliveryCont) {
    deliveryCont.innerHTML = SITE_CONFIG.delivery.disponible
      ? `<a class="btn btn--outline" href="${SITE_CONFIG.delivery.url}" target="_blank" rel="noopener">Pedí por ${SITE_CONFIG.delivery.nombreApp}</a>`
      : `<p class="delivery-nota">Estamos confirmando la app de delivery. Mientras tanto, hacé tu pedido por WhatsApp o llamando — misma atención, sin intermediarios.</p>`;
  }
}

function pintarJsonLd() {
  const script = document.getElementById("ld-json");
  if (!script) return;
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE_CONFIG.nombre,
    servesCuisine: "Parrilla argentina",
    priceRange: "$$",
    telephone: SITE_CONFIG.telefono,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.direccion,
      addressLocality: "Villa Urquiza, CABA",
      addressCountry: "AR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "12:00",
        closes: "23:30",
      },
    ],
    sameAs: [SITE_CONFIG.instagramUrl],
  };
  script.textContent = JSON.stringify(data);
}

document.addEventListener("DOMContentLoaded", async () => {
  Navigation.init();
  Carrusel.init();
  pintarContacto();
  pintarJsonLd();
  await Menu.init();
  // Las cards de destacados recién existen después de esto, así que el
  // carrusel de portada necesita recalcular si hay overflow para scrollear.
  Carrusel.refrescar();
});
