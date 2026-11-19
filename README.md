# Femiapp feedback · Feminario

Formulario de una pregunta para saber qué esperan las mujeres de una app de finanzas.
Campos: **nombre, correo, celular** y **«¿Qué esperas que una app de finanzas hiciera por ti?»**, con autorización de datos.

- **Formulario:** https://feminario.github.io/femiapp-feedback/
- **Código QR** (lleva `?origen=qr` para saber cuántas respuestas vienen del QR): [qr.png](qr.png) · [qr.svg](qr.svg)

## Guardar las respuestas en Google Sheets (una sola vez, 2 minutos)
1. Entra a **script.new** con la cuenta de Feminario y pega [apps-script/Code.gs](apps-script/Code.gs).
2. **Implementar → Nueva implementación → Aplicación web** → ejecutar como **yo**, acceso **Cualquier persona**.
3. Copia la URL que termina en `/exec` en `API_URL` de [assets/config.js](assets/config.js) y sube el cambio.

La hoja «Femiapp feedback» se crea sola con la primera respuesta (una fila por persona: fecha, nombre, correo, celular, respuesta, origen). Para abrirla, ejecuta `enlaceDeLaHoja()` en el editor y mira el registro.
Mientras `API_URL` esté vacía, el formulario avisa que aún no está conectado y no simula el envío.

## Diseño
Colores, tipografías (MuseoModerno + Montserrat), formas y confeti de la identidad de Feminario (mismos recursos de *Tu mapa de dinero*).
