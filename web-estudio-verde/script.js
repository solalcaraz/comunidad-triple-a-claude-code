(function () {
  'use strict';

  /* ===================== Menú mobile ===================== */
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  function closeNav() {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* ===================== Resaltado de sección activa ===================== */
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = Array.prototype.map.call(navLinks, function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = '#' + entry.target.id;
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === id);
      });
    });
  }, { rootMargin: '-50% 0px -45% 0px' });

  sections.forEach(function (section) { navObserver.observe(section); });

  /* ===================== Filtro de proyectos ===================== */
  var filtroBtns = Array.prototype.slice.call(document.querySelectorAll('.filtro-btn'));
  var proyectoCards = Array.prototype.slice.call(document.querySelectorAll('.proyecto-card'));

  /* "Ver más proyectos": en celular se muestran solo los primeros 3 del filtro activo */
  var LIMITE_MOBILE = 3;
  var masBtn = document.getElementById('proyectos-mas');
  var mqMobile = window.matchMedia('(max-width: 640px)');
  var expandido = false;

  function actualizarVerMas() {
    var delFiltro = proyectoCards.filter(function (card) { return !card.classList.contains('is-hidden'); });
    var colapsar = mqMobile.matches && !expandido;
    proyectoCards.forEach(function (card) { card.classList.remove('is-extra'); });
    if (colapsar) {
      delFiltro.slice(LIMITE_MOBILE).forEach(function (card) { card.classList.add('is-extra'); });
    }
    masBtn.hidden = !(mqMobile.matches && delFiltro.length > LIMITE_MOBILE);
    masBtn.textContent = expandido ? 'Ver menos' : 'Ver más proyectos';
    masBtn.setAttribute('aria-expanded', String(expandido));
  }

  masBtn.addEventListener('click', function () {
    expandido = !expandido;
    actualizarVerMas();
  });
  mqMobile.addEventListener('change', actualizarVerMas);

  filtroBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;

      filtroBtns.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });

      proyectoCards.forEach(function (card) {
        var matches = filter === 'todos' || card.dataset.categoria === filter;
        card.classList.toggle('is-hidden', !matches);
      });

      expandido = false;
      actualizarVerMas();
    });
  });

  actualizarVerMas();

  /* ===================== Lightbox de proyectos ===================== */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.proyecto-trigger'));

  function visibleTriggers() {
    return triggers.filter(function (trigger) {
      var card = trigger.closest('.proyecto-card');
      return !card || !(card.classList.contains('is-hidden') || card.classList.contains('is-extra'));
    });
  }

  function dataFromTrigger(trigger) {
    var card = trigger.closest('.proyecto-card') || trigger;
    var img = trigger.querySelector('img');
    var tag = card.querySelector('.proyecto-tag');
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      titulo: card.querySelector('.proyecto-titulo').textContent.trim(),
      desc: card.querySelector('.proyecto-desc').textContent.trim(),
      tag: tag ? tag.textContent.trim() : '',
      tagClass: tag ? tag.className : '',
      m2: card.dataset.m2 || '',
      duracion: card.dataset.duracion || ''
    };
  }

  if (triggers.length) {
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Vista ampliada del proyecto');
    lightbox.innerHTML =
      '<div class="lightbox-content">' +
        '<button class="lightbox-close" aria-label="Cerrar">&times;</button>' +
        '<div class="lightbox-media">' +
          '<button class="lightbox-prev" aria-label="Proyecto anterior">&#8249;</button>' +
          '<img src="" alt="">' +
          '<button class="lightbox-next" aria-label="Proyecto siguiente">&#8250;</button>' +
        '</div>' +
        '<div class="lightbox-info">' +
          '<span class="proyecto-tag lightbox-tag"></span>' +
          '<span class="proyecto-titulo"></span>' +
          '<span class="proyecto-desc"></span>' +
          '<div class="lightbox-datos">' +
            '<span class="lightbox-m2"></span>' +
            '<span class="lightbox-duracion"></span>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector('img');
    var lbTag = lightbox.querySelector('.lightbox-tag');
    var lbTitulo = lightbox.querySelector('.proyecto-titulo');
    var lbDesc = lightbox.querySelector('.proyecto-desc');
    var lbM2 = lightbox.querySelector('.lightbox-m2');
    var lbDuracion = lightbox.querySelector('.lightbox-duracion');
    var lbDatos = lightbox.querySelector('.lightbox-datos');
    var lbClose = lightbox.querySelector('.lightbox-close');
    var lbPrev = lightbox.querySelector('.lightbox-prev');
    var lbNext = lightbox.querySelector('.lightbox-next');

    var currentList = [];
    var currentIndex = 0;
    var lastFocused = null;

    function render(index) {
      currentIndex = (index + currentList.length) % currentList.length;
      var p = dataFromTrigger(currentList[currentIndex]);
      lbImg.setAttribute('src', p.src);
      lbImg.setAttribute('alt', p.alt);
      lbTag.textContent = p.tag;
      lbTag.className = 'lightbox-tag ' + p.tagClass;
      lbTitulo.textContent = p.titulo;
      lbDesc.textContent = p.desc;
      lbM2.textContent = p.m2;
      lbDuracion.textContent = p.duracion;
      lbDatos.style.display = (p.m2 || p.duracion) ? 'flex' : 'none';
    }

    function openLightbox(trigger) {
      currentList = visibleTriggers();
      var startIndex = currentList.indexOf(trigger);
      lastFocused = document.activeElement;
      render(startIndex === -1 ? 0 : startIndex);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
      document.addEventListener('keydown', onKeydown);
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { render(currentIndex - 1); return; }
      if (e.key === 'ArrowRight') { render(currentIndex + 1); return; }

      if (e.key === 'Tab') {
        var focusables = lightbox.querySelectorAll('button');
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () { openLightbox(trigger); });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { render(currentIndex - 1); });
    lbNext.addEventListener('click', function () { render(currentIndex + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ===================== Reveal del proceso ===================== */
  var procesoSteps = document.querySelectorAll('.proceso-step');
  if (procesoSteps.length) {
    var stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          stepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    procesoSteps.forEach(function (step) { stepObserver.observe(step); });
  }

  /* ===================== Datos de contacto (un solo lugar) ===================== */
  // DATOS DE EJEMPLO: caso de práctica. Para publicar con datos reales, cambiar solo los valores de CONTACTO.
  // WhatsApp: código de país + 9 + área + número, sin espacios ni signos. El mail usa .test (dominio reservado, no existe).
  // Instagram: vacío = lleva a instagram.com (neutro). Con perfil real, poner solo el usuario, ej. 'usuario'.
  var CONTACTO = {
    whatsapp: '5490000000000',
    mail: 'ejemplo@estudioverde.test',
    instagram: ''
  };
  var MENSAJE_WHATSAPP = 'Hola, quiero consultar por un proyecto de arquitectura y/o paisajismo.';
  var ASUNTO_MAIL = 'Consulta desde la web de Estudio Verde';

  document.querySelectorAll('[data-contacto="whatsapp"]').forEach(function (link) {
    link.href = 'https://wa.me/' + CONTACTO.whatsapp + '?text=' + encodeURIComponent(MENSAJE_WHATSAPP);
  });
  document.querySelectorAll('[data-contacto="mail"]').forEach(function (link) {
    link.href = 'mailto:' + CONTACTO.mail + '?subject=' + encodeURIComponent(ASUNTO_MAIL);
  });
  document.querySelectorAll('[data-mail-texto]').forEach(function (el) {
    el.textContent = 'O escribí a ' + CONTACTO.mail;
    el.hidden = false;
  });
  if (CONTACTO.instagram) {
    document.querySelectorAll('[data-contacto="instagram"]').forEach(function (link) {
      link.href = 'https://instagram.com/' + CONTACTO.instagram;
    });
  }
})();
