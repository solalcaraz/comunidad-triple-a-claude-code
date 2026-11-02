// ============================================================
// CARRUSELES INTERNOS — tiras horizontales con scroll propio
// (destacados de portada, fotos de "Conocenos", tarjetas de
// "Servicios"). Suman flechas de apoyo al gesto de deslizar y
// exponen su selector [data-carrusel-track] para que navigation.js
// pueda distinguir "deslizo la tira" de "deslizo para cambiar de
// página" y no confunda una cosa con la otra.
// ============================================================

const Carrusel = (() => {
  const grupos = [];

  function actualizar(grupo) {
    const { wrap, track, prev, next } = grupo;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const hayOverflow = maxScroll > 4;
    wrap.classList.toggle("carrusel--sin-overflow", !hayOverflow);
    if (!hayOverflow) return;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= maxScroll - 4;
  }

  function wireGrupo(wrap) {
    const track = wrap.querySelector("[data-carrusel-track]");
    const prev = wrap.querySelector(".carrusel-flecha--prev");
    const next = wrap.querySelector(".carrusel-flecha--next");
    if (!track || !prev || !next) return;

    const grupo = { wrap, track, prev, next };
    grupos.push(grupo);

    const ir = (direccion) => {
      track.scrollBy({ left: direccion * track.clientWidth * 0.8, behavior: "smooth" });
    };

    prev.addEventListener("click", () => ir(-1));
    next.addEventListener("click", () => ir(1));
    track.addEventListener("scroll", () => actualizar(grupo), { passive: true });

    actualizar(grupo);
  }

  function refrescar() {
    grupos.forEach(actualizar);
  }

  function init() {
    document.querySelectorAll(".carrusel").forEach(wireGrupo);
    window.addEventListener("resize", refrescar);
  }

  // Centra un elemento puntual de la tira (p. ej. la foto de Don Nino
  // en el medio del timeline) dentro del área visible del carrusel.
  function centrarElemento(selectorTrack, selectorElemento) {
    const track = document.querySelector(selectorTrack);
    const el = document.querySelector(selectorElemento);
    if (!track || !el) return;
    track.scrollLeft = Math.max(0, el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2);

    const grupo = grupos.find((g) => g.track === track);
    if (grupo) actualizar(grupo);
  }

  return { init, refrescar, centrarElemento };
})();
