// ============================================================
// NAVEGACIÓN TIPO "CARTA" — 4 páginas navegables por pestañas,
// flechas, swipe horizontal, teclado y hash de la URL.
// ============================================================

const Navigation = (() => {
  const PAGINAS = ["portada", "menu", "conocenos", "servicios", "contacto"];
  let indiceActual = 0;

  let track, viewport, tabs, indicador, flechaPrev, flechaNext, menuToggle, menuPanel;

  function indicePorHash() {
    const hash = window.location.hash.replace("#", "");
    const i = PAGINAS.indexOf(hash);
    return i === -1 ? 0 : i;
  }

  function aplicarEstado() {
    // El track mide PAGINAS.length * 100% (cada página ocupa 1/N de ese
    // ancho), así que un desplazamiento de "una página" es -(100/N)% del
    // ancho del propio track, no -100%.
    const pasoPorcentaje = 100 / PAGINAS.length;
    track.style.transform = `translateX(-${indiceActual * pasoPorcentaje}%)`;

    tabs.forEach((tab) => {
      tab.classList.toggle("tab--activa", tab.dataset.page === PAGINAS[indiceActual]);
    });

    if (indicador) {
      indicador.textContent = `${indiceActual + 1}/${PAGINAS.length}`;
    }

    if (flechaPrev) flechaPrev.disabled = indiceActual === 0;
    if (flechaNext) flechaNext.disabled = indiceActual === PAGINAS.length - 1;

    document.querySelectorAll(".pagina").forEach((sec) => {
      sec.setAttribute("aria-hidden", sec.dataset.page === PAGINAS[indiceActual] ? "false" : "true");
    });

    // Al entrar a "Conocenos" la foto de Don Nino (la del medio) queda
    // centrada en la tira, en vez de arrancar mostrando sólo la primera
    // foto con las demás fuera de vista.
    if (PAGINAS[indiceActual] === "conocenos") {
      Carrusel.centrarElemento(".historia-timeline", ".historia-foto--oficio");
    }
  }

  function irA(indice, { actualizarHistorial = true } = {}) {
    indiceActual = Math.max(0, Math.min(PAGINAS.length - 1, indice));
    aplicarEstado();
    if (actualizarHistorial) {
      const url = `#${PAGINAS[indiceActual]}`;
      if (window.location.hash !== url) {
        history.pushState(null, "", url);
      }
    }
  }

  function irAPorNombre(nombre) {
    const i = PAGINAS.indexOf(nombre);
    if (i !== -1) irA(i);
  }

  function wireTabs() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        irAPorNombre(tab.dataset.page);
        cerrarMenu();
      });
    });
  }

  // ===== Panel desplegable (navbar comprimido en mobile) =====

  function cerrarMenu() {
    if (!menuPanel) return;
    menuPanel.classList.remove("abierto");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  function abrirMenu() {
    if (!menuPanel) return;
    menuPanel.classList.add("abierto");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
  }

  function wireMenuToggle() {
    if (!menuToggle || !menuPanel) return;

    menuToggle.addEventListener("click", () => {
      if (menuPanel.classList.contains("abierto")) cerrarMenu();
      else abrirMenu();
    });

    // Cerrar al tocar afuera de la barra, para que el panel no quede
    // abierto tapando el contenido cuando el usuario sigue navegando.
    document.addEventListener("click", (e) => {
      if (!menuPanel.classList.contains("abierto")) return;
      if (e.target.closest(".tabs-carta")) return;
      cerrarMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrarMenu();
    });
  }

  function wireFlechas() {
    if (flechaPrev) flechaPrev.addEventListener("click", () => irA(indiceActual - 1));
    if (flechaNext) flechaNext.addEventListener("click", () => irA(indiceActual + 1));
  }

  function wireTeclado() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") irA(indiceActual + 1);
      if (e.key === "ArrowLeft") irA(indiceActual - 1);
    });
  }

  function wireSwipe() {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    viewport.addEventListener(
      "touchstart",
      (e) => {
        // Si el gesto arranca dentro de una tira con scroll propio
        // (destacados, fotos de "Conocenos", tarjetas de "Servicios")
        // o sobre sus flechas, lo dejamos en manos de ese carrusel:
        // si no, un swipe para ver el plato siguiente terminaba
        // interpretado como "cambiar de página" y saltaba a otra sección.
        if (e.target.closest("[data-carrusel-track], .carrusel-flecha")) {
          tracking = false;
          return;
        }
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchend",
      (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        const UMBRAL = 50;
        if (Math.abs(dx) > UMBRAL && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) irA(indiceActual + 1);
          else irA(indiceActual - 1);
        }
      },
      { passive: true }
    );
  }

  function wireEnlacesInternos() {
    // Delegado en document: cualquier <a href="#pagina"> (tenga o no
    // data-goto) queda interceptado acá. Si dependiéramos de marcar
    // cada link a mano con data-goto, alguno se termina escapando y el
    // navegador hace su salto nativo de anchor — que no sabe nada de
    // nuestro slider por transform y deja la pestaña activa desincronizada
    // de la página que realmente se ve.
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const nombre = link.getAttribute("href").slice(1);
      if (!PAGINAS.includes(nombre)) return;
      e.preventDefault();
      irAPorNombre(nombre);
    });
  }

  function wirePopstate() {
    window.addEventListener("popstate", () => {
      irA(indicePorHash(), { actualizarHistorial: false });
    });
    // Red de seguridad: si algún salto de anchor nativo se escapa igual
    // (por ejemplo un link agregado sin pasar por acá), resincroniza la
    // página visible con el hash real en lugar de quedar desalineada.
    window.addEventListener("hashchange", () => {
      irA(indicePorHash(), { actualizarHistorial: false });
    });
  }

  function init() {
    track = document.querySelector(".carta-track");
    viewport = document.querySelector(".carta-viewport");
    tabs = Array.from(document.querySelectorAll(".tab-carta"));
    indicador = document.getElementById("pagina-indicador");
    flechaPrev = document.querySelector(".flecha--prev");
    flechaNext = document.querySelector(".flecha--next");
    menuToggle = document.getElementById("tabs-toggle");
    menuPanel = document.getElementById("tabs-panel");

    // Al cargar la página directo en un hash de sección (compartir un
    // link a "#conocenos", recargar estando ahí, etc.) el navegador
    // hace su propio salto nativo al elemento con ese id y desplaza
    // .carta-viewport — que tiene overflow:hidden pero sigue siendo
    // scrolleable de forma programática. Ese scroll nativo se suma al
    // transform que ya aplicamos nosotros y termina mostrando una
    // página corrida de la que la pestaña activa indica. Como acá
    // nunca debería scrollear (todo el scroll real pasa por dentro de
    // cada .pagina), lo neutralizamos apenas aparece.
    viewport.scrollLeft = 0;
    viewport.addEventListener("scroll", () => {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    });

    wireTabs();
    wireFlechas();
    wireTeclado();
    wireSwipe();
    wireEnlacesInternos();
    wirePopstate();
    wireMenuToggle();

    irA(indicePorHash(), { actualizarHistorial: false });
  }

  return { init, irAPorNombre };
})();
