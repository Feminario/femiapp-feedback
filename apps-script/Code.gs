/**
 * Feminario — Tu app de Finanzas (formulario del evento)
 * Cada respuesta se agrega como una fila NUEVA a la hoja «LEADS CLUB 365 - 3RA COHORTE» (pestaña «Hoja 1»), con Origen = «Evento ignia».
 * Las columnas se buscan por su encabezado (Nombre, Whatsapp, Email, Fecha, Origen); la respuesta va en la columna
 * «¿Qué esperarías que una app de finanzas hiciera por ti?», que se crea al final la primera vez. No se toca ninguna otra columna.
 *
 * Instalación (una sola vez, 2 minutos):
 *  1. Entra a script.new con la cuenta de Feminario que puede editar la hoja y pega este archivo.
 *  2. Implementar → Nueva implementación → Aplicación web → Ejecutar como YO · Acceso: Cualquier persona → Implementar (autoriza el acceso a la hoja).
 *  3. Copia la URL que termina en /exec en assets/config.js (API_URL).
 */
var SHEET_ID = "1D9tDfr-ABr-0PomegBH1DSnFyUXkZR4MVsGqHqvugkc";
var HOJA = "Hoja 1";
var PREGUNTA = "¿Qué esperarías que una app de finanzas hiciera por ti?";
var PREGUNTA_ANTES = "¿Qué esperas que una app de finanzas hiciera por ti?";            // título anterior: si la columna ya existe con él, solo se le cambia el encabezado (no se crea otra)
var ORIGEN = "Evento ignia";

// Los encabezados pueden traer espacios invisibles o mayúsculas distintas: se comparan normalizados
function norm_(t) { return String(t == null ? "" : t).replace(/[ ​‌‍﻿]/g, " ").replace(/\s+/g, " ").trim().toLowerCase(); }
function seguro_(v, max) { v = String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max || 300); return /^[=+\-@]/.test(v) ? "'" + v : v; }   // evita fórmulas
function celular_(v) {
  var d = String(v || "").replace(/\D/g, "");
  if (d.length === 10 && d.charAt(0) === "3") d = "57" + d;            // celular colombiano sin indicativo
  return d;                                                           // igual que el resto de la hoja: solo dígitos con indicativo (573209798096)
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d.nombre || !d.correo || !d.respuesta || d.autorizo !== true) return out_({ ok: false, error: "faltan datos" });
    var hoja = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA);
    if (!hoja) return out_({ ok: false, error: "no encuentro la pestaña " + HOJA });
    var ultCol = Math.max(1, hoja.getLastColumn());
    var titulos = hoja.getRange(1, 1, 1, ultCol).getValues()[0].map(norm_);
    function col(nombre) { return titulos.indexOf(norm_(nombre)); }
    var cPregunta = col(PREGUNTA);
    if (cPregunta < 0 && col(PREGUNTA_ANTES) >= 0) {                  // la columna ya existía con el texto anterior: solo se renombra
      cPregunta = col(PREGUNTA_ANTES);
      hoja.getRange(1, cPregunta + 1).setValue(PREGUNTA);
      titulos[cPregunta] = norm_(PREGUNTA);
    }
    if (cPregunta < 0) {                                              // columna nueva al final, con el mismo estilo del encabezado
      cPregunta = titulos.length;
      hoja.getRange(1, cPregunta + 1).setValue(PREGUNTA);
      hoja.getRange(1, ultCol).copyTo(hoja.getRange(1, cPregunta + 1), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      titulos.push(norm_(PREGUNTA));
    }
    var fila = new Array(titulos.length).fill("");
    var poner = function (nombre, valor) { var c = col(nombre); if (c >= 0) fila[c] = valor; };
    poner("Nombre", seguro_(d.nombre, 120));
    poner("Whatsapp", celular_(d.celular));
    poner("Email", seguro_(d.correo, 160));
    poner("Fecha", new Date().toISOString());                         // mismo formato que las demás filas (2026-10-26T12:04:…)
    poner("Origen", ORIGEN);
    fila[cPregunta] = seguro_(d.respuesta, 2000);
    var n = hoja.getLastRow() + 1;
    hoja.getRange(n, 1, 1, fila.length).setValues([fila]);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}
function doGet() { return out_({ ok: true, service: "feminario-tu-app-de-finanzas" }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
