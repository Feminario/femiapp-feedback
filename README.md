# Tu app de Finanzas · Feminario

Formulario de una pregunta para saber qué esperan las mujeres de una app de finanzas.
Flujo: **paso 1** (nombre, correo, celular y «¿Qué esperarías que una app de finanzas hiciera por ti?», con autorización de datos; el botón dice «Te avisaremos cuando puedas continuar») → **paso 2** («¿Qué dolor te gustaría escalar?») → **gracias** con la foto de Andrea y Tina.
Lo del paso 1 se guarda al tocar el botón; el paso 2 completa esa misma fila.

- **Formulario:** https://feminario.github.io/femiapp-feedback/
- **Panel de la nube de palabras (solo equipo):** https://feminario.github.io/femiapp-feedback/admin/ · con `?demo=1` muestra datos de ejemplo
- **Código QR:** [qr.png](qr.png) · [qr.svg](qr.svg)

## Guardar las respuestas en la hoja de leads (una sola vez, 2 minutos)
Cada respuesta se agrega como una fila nueva a **LEADS CLUB 365 - 3RA COHORTE** (pestaña «Hoja 1»): Nombre, Whatsapp (solo dígitos con indicativo), Email, Fecha y **Origen = «Evento ignia»**. La respuesta a la pregunta va en una columna nueva al final, «¿Qué esperarías que una app de finanzas hiciera por ti?». No se toca ninguna otra columna.
1. Entra a **script.new** con la cuenta de Feminario que puede editar la hoja y pega [apps-script/Code.gs](apps-script/Code.gs).
2. **Implementar → Nueva implementación → Aplicación web** → ejecutar como **yo**, acceso **Cualquier persona** (autoriza el acceso a la hoja).
3. Copia la URL que termina en `/exec` en `API_URL` de [assets/config.js](assets/config.js) y sube el cambio.

Mientras `API_URL` esté vacía, el formulario avisa que aún no está conectado y no simula el envío.

## Panel /admin (nube de palabras para el screenshot)
- Sin clave. El script solo devuelve el **conteo de palabras** de las dos preguntas (nunca las frases completas, ni nombres, correos o celulares), de las filas con Origen «Evento ignia».
- Fondo blanco y neutros de la identidad (los más frecuentes en el morado oscuro, los demás más suaves).
- Pestañas: lo que esperarían de una app · el dolor que quieren escalar · todas las palabras. Caja **Ocultar palabras** para quitar ruido (app, finanzas…).
- **Modo captura:** deja solo el título y la nube a pantalla completa para el screenshot; `Esc` para salir.

## Diseño
Colores, tipografías (MuseoModerno + Montserrat), formas y confeti de la identidad de Feminario (mismos recursos de *Tu mapa de dinero*).
