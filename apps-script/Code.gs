/**
 * Feminario — Femiapp feedback
 * Guarda cada respuesta del formulario en una hoja «Respuestas» (una fila por persona).
 * Instalación (una sola vez, 2 minutos):
 *  1. Entra a script.new (con la cuenta de Feminario) y pega este archivo.
 *  2. Implementar → Nueva implementación → Aplicación web → Ejecutar como YO · Acceso: Cualquier persona → Implementar.
 *  3. Copia la URL que termina en /exec en assets/config.js (API_URL).
 * La hoja de cálculo «Femiapp feedback» se crea sola la primera vez que llega una respuesta; en Ejecuciones/Propiedades queda su ID.
 * Para ver el enlace de la hoja: ejecuta la función enlaceDeLaHoja() y mira el registro.
 */
var COLS = ["Fecha", "Nombre", "Correo", "Celular", "¿Qué esperas que una app de finanzas hiciera por ti?", "Origen", "Autorizó datos"];

function hoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID"), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create("Femiapp feedback"); props.setProperty("SHEET_ID", ss.getId()); }
  var sh = ss.getSheetByName("Respuestas");
  if (!sh) {
    sh = ss.getSheets()[0].setName("Respuestas");
    sh.appendRow(COLS); sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight("bold").setBackground("#C2CBFF");
    sh.setColumnWidth(5, 420);
  }
  return sh;
}
function seguro_(v, max) { v = String(v == null ? "" : v).slice(0, max || 300); return /^[=+\-@]/.test(v) ? "'" + v : v; }   // evita fórmulas

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d.nombre || !d.correo || !d.respuesta || d.autorizo !== true) return out_({ ok: false, error: "faltan datos" });
    hoja_().appendRow([new Date(), seguro_(d.nombre, 120), seguro_(d.correo, 160), seguro_(d.celular, 30), seguro_(d.respuesta, 2000), seguro_(d.origen, 30), "Sí"]);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}
function doGet() { return out_({ ok: true, service: "feminario-femiapp-feedback" }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function enlaceDeLaHoja() { Logger.log(hoja_().getParent().getUrl()); }
