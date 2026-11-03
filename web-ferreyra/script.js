// Datos de contacto de EJEMPLO: reemplazar por los reales del estudio.
const CONTACTO = {
  whatsapp: "5490000000000",
  mail: "ejemplo@ferreyra.test"
};

// Menú de celular (hamburguesa con desplegable)
const menuNav = document.querySelector("nav");
const menuBoton = menuNav.querySelector(".menu-boton");
menuNav.classList.add("con-js");

function cerrarMenu() {
  menuNav.classList.remove("abierto");
  menuBoton.setAttribute("aria-expanded", "false");
  menuBoton.setAttribute("aria-label", "Abrir el menú");
}

menuBoton.addEventListener("click", () => {
  const abierto = menuNav.classList.toggle("abierto");
  menuBoton.setAttribute("aria-expanded", String(abierto));
  menuBoton.setAttribute("aria-label", abierto ? "Cerrar el menú" : "Abrir el menú");
});
menuNav.querySelectorAll("ul a").forEach((a) => a.addEventListener("click", cerrarMenu));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });

const form = document.getElementById("form-consulta");
const campoMail = document.getElementById("campo-mail");
const inputMail = campoMail.querySelector("input");
const botonEnvio = document.getElementById("boton-envio");

// Si elige responder por mail, aparece el campo de mail (obligatorio) y el botón cambia.
form.elements.contacto.addEventListener("change", () => {
  const porMail = form.elements.contacto.value === "Por mail";
  campoMail.hidden = !porMail;
  inputMail.required = porMail;
  botonEnvio.textContent = porMail ? "Enviar por mail" : "Enviar por WhatsApp";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const comentario = (d.get("mensaje") || "").trim();
  const porMail = d.get("contacto") === "Por mail";

  const lineas = [
    `Hola, soy ${d.get("nombre").trim()}.`,
    `Quiero consultar por: ${d.get("necesidad")}.`,
    `Mi situación: ${d.get("situacion")}.`,
    `Prefiero que me respondan: ${d.get("contacto")}.`
  ];
  if (porMail) lineas.push(`Mi mail: ${d.get("mail").trim()}.`);
  if (comentario) lineas.push(`Comentario: ${comentario}`);
  const texto = lineas.join("\n");

  let url;
  if (porMail) {
    url = `mailto:${CONTACTO.mail}?subject=${encodeURIComponent("Consulta desde la web: " + d.get("necesidad"))}&body=${encodeURIComponent(texto)}`;
  } else {
    url = `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(texto)}`;
  }
  // Con "noopener", window.open siempre devuelve null: por eso se abre con un enlace temporal.
  const enlace = document.createElement("a");
  enlace.href = url;
  if (!porMail) {
    enlace.target = "_blank";
    enlace.rel = "noopener";
  }
  enlace.click();
});
