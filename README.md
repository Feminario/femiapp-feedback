# Tu app de Finanzas · Feminario

Formulario de una pregunta para saber qué esperan las mujeres de una app de finanzas.
Campos: **nombre, correo, celular** y **«¿Qué esperas que una app de finanzas hiciera por ti?»**, con autorización de datos.

- **Formulario:** https://feminario.github.io/femiapp-feedback/
- **Código QR:** [qr.png](qr.png) · [qr.svg](qr.svg)

## Guardar las respuestas en la hoja de leads (una sola vez, 2 minutos)
Cada respuesta se agrega como una fila nueva a **LEADS CLUB 365 - 3RA COHORTE** (pestaña «Hoja 1»): Nombre, Whatsapp (solo dígitos con indicativo), Email, Fecha y **Origen = «Evento ignia»**. La respuesta a la pregunta va en una columna nueva al final, «¿Qué esperas que una app de finanzas hiciera por ti?». No se toca ninguna otra columna.
1. Entra a **script.new** con la cuenta de Feminario que puede editar la hoja y pega [apps-script/Code.gs](apps-script/Code.gs).
2. **Implementar → Nueva implementación → Aplicación web** → ejecutar como **yo**, acceso **Cualquier persona** (autoriza el acceso a la hoja).
3. Copia la URL que termina en `/exec` en `API_URL` de [assets/config.js](assets/config.js) y sube el cambio.

Mientras `API_URL` esté vacía, el formulario avisa que aún no está conectado y no simula el envío.

## Diseño
Colores, tipografías (MuseoModerno + Montserrat), formas y confeti de la identidad de Feminario (mismos recursos de *Tu mapa de dinero*).
