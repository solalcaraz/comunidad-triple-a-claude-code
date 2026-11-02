// ============================================================
// MENÚ — carga y parseo de la Google Sheet publicada como CSV,
// y render de la página de menú + la tira de destacados de portada.
// ============================================================

const Menu = (() => {
  // Menú mínimo de emergencia por si falla el fetch a la planilla
  // (sin conexión, sheet no disponible, etc.) para que la página
  // nunca quede vacía.
  const FALLBACK_ITEMS = [
    { categoria: "De la Parrilla", plato: "Asado de tira", descripcion: "Corte clásico a las brasas", precio: "$12.800", destacado: false, foto: null },
    { categoria: "Postres", plato: "Flan de Don Nino", descripcion: "Con dulce de leche y crema", precio: "$4.500", destacado: true, foto: "images/flan-don-nino.jpg" },
  ];

  function normalizar(texto) {
    return (texto || "").trim().toLowerCase();
  }

  function resolverBadge(nombrePlato) {
    return SITE_CONFIG.badgePorPlato[normalizar(nombrePlato)] || null;
  }

  function resolverFoto(nombrePlato, urlFotoSheet) {
    if (urlFotoSheet && urlFotoSheet.trim()) return urlFotoSheet.trim();
    const key = normalizar(nombrePlato);
    return SITE_CONFIG.fotoPorPlato[key] || null;
  }

  function filaAItem(fila) {
    const plato = fila["Plato"] || "";
    return {
      categoria: (fila["Categoría"] || "Otros").trim(),
      plato: plato.trim(),
      descripcion: (fila["Descripción"] || "").trim(),
      precio: (fila["Precio"] || "").trim(),
      destacado: normalizar(fila["Foto destacada"]) === "si",
      foto: resolverFoto(plato, fila["URL Foto"]),
    };
  }

  const CACHE_KEY = "fogon-menu-cache-v1";

  function leerCache() {
    try {
      const items = JSON.parse(localStorage.getItem(CACHE_KEY));
      return Array.isArray(items) && items.length ? items : null;
    } catch {
      return null;
    }
  }

  function guardarCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    } catch {
      // Almacenamiento no disponible (modo privado, cuota llena, etc.): sin cache, sin problema.
    }
  }

  async function fetchItemsFrescos() {
    // Si la planilla tarda de más, cortamos rápido y caemos a cache/fallback
    // en vez de dejar la tira de destacados vacía mientras el usuario espera.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(SITE_CONFIG.menuCsvUrl, { cache: "no-store", signal: controller.signal });
      if (!res.ok) throw new Error("No se pudo obtener la planilla");
      const texto = await res.text();
      const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
      const items = parsed.data.map(filaAItem).filter((it) => it.plato);
      if (!items.length) throw new Error("Planilla vacía");
      return items;
    } finally {
      clearTimeout(timeout);
    }
  }

  function categoriasEnOrden(items) {
    const vistas = [];
    items.forEach((it) => {
      if (!vistas.includes(it.categoria)) vistas.push(it.categoria);
    });
    return vistas;
  }

  function slugCategoria(categoria) {
    const sinAcentos = categoria.normalize("NFD").replace(/[̀-ͯ]/g, "");
    return (
      "cat-" +
      sinAcentos
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  }

  function filaMenuHTML(item) {
    const badge = resolverBadge(item.plato);
    const nombre = badge ? `${item.plato} <span class="badge-orgullo">${badge}</span>` : item.plato;

    return `
      <li class="menu-item">
        <div class="menu-item__cabecera">
          <span class="menu-item__nombre">${nombre}</span>
          <span class="menu-item__linea" aria-hidden="true"></span>
          <span class="menu-item__precio">${item.precio}</span>
        </div>
        ${item.descripcion ? `<p class="menu-item__desc">${item.descripcion}</p>` : ""}
      </li>
    `;
  }

  function renderChips(categorias) {
    const cont = document.getElementById("menu-chips");
    if (!cont) return;

    const chipsCategoria = categorias
      .map((cat) => `<button type="button" class="chip" data-jump="${slugCategoria(cat)}">${cat}</button>`)
      .join("");

    // El botón "Más" va primero en el DOM (no al final) para asegurarse
    // de que quede en la primera fila y visible aun cuando el resto de
    // los chips está colapsado en mobile (ver .menu-chips en el CSS).
    cont.innerHTML = `
      <button type="button" class="chip chip--mas" id="menu-chips-toggle" aria-expanded="false">
        <span data-texto>Más</span><span class="chip--mas-flecha" aria-hidden="true">▾</span>
      </button>
      ${chipsCategoria}
    `;

    cont.querySelectorAll(".chip:not(.chip--mas)").forEach((btn) => {
      btn.addEventListener("click", () => {
        cont.querySelectorAll(".chip:not(.chip--mas)").forEach((c) => c.classList.remove("chip--activa"));
        btn.classList.add("chip--activa");
        document.getElementById(btn.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const toggle = document.getElementById("menu-chips-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const expandido = cont.classList.toggle("menu-chips--expandido");
        toggle.setAttribute("aria-expanded", String(expandido));
        toggle.querySelector("[data-texto]").textContent = expandido ? "Menos" : "Más";
        toggle.querySelector(".chip--mas-flecha").textContent = expandido ? "▴" : "▾";
      });
    }
  }

  function renderLista(items) {
    const cont = document.getElementById("menu-grid");
    if (!cont) return;
    const categorias = categoriasEnOrden(items);
    cont.innerHTML = categorias
      .map((cat) => {
        const platosCat = items.filter((it) => it.categoria === cat);
        return `
          <section class="menu-categoria" id="${slugCategoria(cat)}">
            <h2 class="menu-categoria-titulo">${cat}</h2>
            <ul class="menu-lista">
              ${platosCat.map(filaMenuHTML).join("")}
            </ul>
          </section>
        `;
      })
      .join("");
  }

  function renderPaginaMenu(items) {
    const categorias = categoriasEnOrden(items);
    renderChips(categorias);
    renderLista(items);
  }

  function renderDestacadosSkeleton() {
    const cont = document.getElementById("destacados-strip");
    if (!cont) return;
    cont.innerHTML = Array.from({ length: 5 })
      .map(() => `<div class="destacado-card destacado-card--skeleton" aria-hidden="true"></div>`)
      .join("");
  }

  function renderDestacadosPortada(items) {
    const cont = document.getElementById("destacados-strip");
    if (!cont) return;
    const destacados = items.filter((it) => it.foto && it.destacado);
    if (!destacados.length) {
      cont.innerHTML = "";
      return;
    }
    cont.innerHTML = destacados
      .map(
        (it) => `
        <a href="#menu" class="destacado-card">
          <img src="${it.foto}" alt="${it.plato}" loading="lazy" width="320" height="240">
          <div class="destacado-info">
            <span class="destacado-nombre">${it.plato}</span>
            <span class="destacado-precio">${it.precio}</span>
          </div>
        </a>
      `
      )
      .join("");
  }

  async function init() {
    const cache = leerCache();
    if (cache) {
      renderPaginaMenu(cache);
      renderDestacadosPortada(cache);
    } else {
      renderDestacadosSkeleton();
    }

    let items;
    try {
      items = await fetchItemsFrescos();
      guardarCache(items);
    } catch (err) {
      console.warn("Menu: usando datos de respaldo —", err.message);
      items = cache || FALLBACK_ITEMS;
    }

    renderPaginaMenu(items);
    renderDestacadosPortada(items);
    return items;
  }

  return { init };
})();
