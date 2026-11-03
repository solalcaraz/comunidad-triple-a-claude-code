# El Fogón de Don Nino

Web de una parrilla de barrio con 40 años de historia, en Villa Urquiza. Es un caso ficticio que armé como práctica del módulo de Claude Code de la comunidad Triple A, en 2026. Lo trabajé como un encargo real: ordené lo que pidió el cliente, tomé las decisiones de estructura y diseño, y dirigí a Claude Code, que escribió el código.

## Problema que resuelve

El dueño y su hijo querían que la gente joven los encuentre: "buscan todo en el celular y no aparecemos". Además querían mostrar la carta sin tener que tocar la web cada semana, porque los precios cambian por la inflación.

El desafío de este caso fue el contrario al anterior. Acá el cliente sí quiere mostrar mucho (carta larga, tres formas de comer, reservas, horarios y mapa), y el trabajo fue ordenarlo para que no se sienta abrumador.

## Demo

https://web-fogon-nino.vercel.app

Los datos de contacto son de ejemplo: el WhatsApp y el teléfono no existen, el botón de Instagram lleva a instagram.com y el de delivery a la home de PedidosYa. La dirección (Av. Triunvirato 4324) también es inventada.

Las fotos son de relleno. Las de Ensaladas y las dos categorías de Bebidas son de Pexels: la ensalada de Florencia Potter (https://www.pexels.com/photo/402007/), la limonada de Dylann Hendricks (https://www.pexels.com/photo/15153422/) y la cerveza de Little Visuals (https://www.pexels.com/photo/1862/). Del resto no verifiqué el origen. En un proyecto real las reemplazaría por las del cliente.

## Tecnologías

- HTML: estructura de la página, en un solo archivo.
- CSS: estilos y diseño adaptable a celular, sin framework. Los colores están definidos como variables.
- JavaScript sin build: navegación por páginas deslizables, carta, carruseles y links de contacto.
- Google Sheets publicada como CSV: es la carta. Se lee con PapaParse.
- Google Fonts (Fraunces y Work Sans): tipografías.
- Google Maps embebido: mapa de la ubicación.
- Vercel: publica la web desde este repo.
- Claude Code: escribió el código a partir de las decisiones que fui definiendo.

## Cómo funciona

Es una página estática: no hay build ni dependencias que instalar.

Las decisiones que tomé y por qué:

- **Carta en una planilla de Google, con fecha de actualización visible.** El cliente no quería editar la web cada semana. Facu cambia los precios en la planilla y la web se actualiza sola, sin tocar código. Elegí mostrar los precios y no una carta sin precios porque quien mira la carta quiere saber cuánto cuesta. Para que un precio viejo no parezca un error, la carta dice "Precios actualizados el...", con una fecha que sale de una columna de la propia planilla.
- **Si la planilla falla, la web igual muestra algo.** Guarda la última carta en el navegador y, si no hay, usa una carta mínima de emergencia.
- **El menú, apenas se entra.** La portada es corta: título, una tarjeta por cada categoría de la carta y los botones de reservar y ver la carta. Cada tarjeta abre la carta en esa categoría. Las tarjetas se arman con las categorías de la planilla, así que si agregan una, aparece sola.
- **Botón flotante de WhatsApp en todas las páginas.** El salón se llena los fines de semana y reservar por WhatsApp tiene que estar siempre a un toque.
- **Datos de contacto en un solo lugar.** Están en `js/config.js`. Para publicar con datos reales se cambian ahí, una vez.
- **Horarios, mapa y formas de pedir a la vista.** A diferencia del caso anterior, el cliente sí quiere mostrar dirección y mapa. Salón, take away y delivery van en tres tarjetas y no en un párrafo.
- **Fondo de portada más liviano.** La imagen de fondo pasó de 2,4 MB a 207 KB.
- **Texto de la planilla escapado.** Antes de mostrarlo en la página, para que una celda con símbolos raros no rompa nada.
- **Vista previa al compartir el link y favicon.** Para que el link se vea bien en WhatsApp.
- **Publicada desde el repo, con su propia configuración.** El repo tiene varias webs, así que el proyecto de Vercel apunta a la carpeta `web-fogon-nino` como Root Directory.

## Planilla de la carta

En la carpeta `planilla/` está el Excel de ejemplo que alimenta la carta (`menu-fogon-de-don-nino.xlsx`). Tiene dos hojas: "Menú", con las columnas Categoría, Plato, Descripción, Precio, Foto destacada y Actualizado, y "Cómo usar esta planilla", con las instrucciones para Facu. La web no lee ese archivo: lee una copia publicada en Google Sheets como CSV, y el Excel queda como muestra de cómo se edita. Los platos y los precios son inventados.

## Cómo correrlo

No se abre con doble clic en `index.html`: el navegador bloquea la lectura de la planilla y la web muestra una carta mínima de respaldo. Desde esta carpeta se levanta un servidor local:

```
python -m http.server 8765
```

y se abre http://localhost:8765. También se puede ver en el link publicado.

## Qué aprendí y qué mejoraría

**Qué aprendí**

- Pensar cómo resolver el problema de los precios con una planilla. El cliente no quería tocar la web cada semana, así que la carta sale de una Google Sheet publicada como CSV: se cambian los precios ahí y la web se actualiza sola. Para que un precio viejo no parezca un error, sumé una columna "Actualizado" que alimenta la fecha visible.
- Que los datos tienen que poder editarlos quienes no saben programar. Pensé la solución para Facu, que ya usa una planilla, y no para mi comodidad.
- Que mucha información se ordena con estructura, no escondiéndola. A diferencia del caso anterior, acá no había que sacar cosas: las categorías de la carta y las tres formas de pedir, en tarjetas, hicieron que se sintiera simple.
- Probar la web desde un servidor local y no con doble clic. Al abrir el archivo directo, la planilla no cargaba y se veía una carta incompleta.
- Que el botón de reservar tiene que estar siempre a la vista. El botón flotante de WhatsApp resolvió la reserva del fin de semana en todas las páginas.

**Qué mejoraría**

- Reemplazar las fotos de relleno por las del cliente, y agregar fotos para todas las categorías de la carta.
- Poner los datos de contacto reales: WhatsApp, teléfono, Instagram y el link de la app de delivery.
- Medir la velocidad con Lighthouse sobre la web publicada y mejorar lo que salga.
- Pasar la carta a un sistema donde Facu pueda subir fotos directamente, sin depender de links externos.
