/**
 * Feminario — Tu app de Finanzas (formulario del evento)
 * Hoja: «LEADS CLUB 365 - 3RA COHORTE» (pestaña «Hoja 1»). Todo lo que llega por el formulario lleva Origen = «Evento ignia».
 *  · PASO 1 (etapa 1): fila NUEVA con Nombre, Whatsapp, Email, Fecha, Origen y la respuesta a «¿Qué esperarías que una app de finanzas hiciera por ti?».
 *  · PASO 2 (etapa 2): completa ESA misma fila (la más reciente con ese correo y ese origen) con «¿Qué dolor te gustaría escalar?».
 * Las columnas se buscan por su encabezado; las dos de preguntas se crean al final la primera vez. No se toca ninguna otra columna.
 *
 * PANEL /admin (nube de palabras): GET ?accion=palabras&clave=... devuelve SOLO los textos de las dos preguntas (sin nombres, correos ni celulares).
 * Exige la clave que tú pongas en Configuración del proyecto → Propiedades del script → CLAVE_ADMIN. Sin esa propiedad, nadie puede leer nada.
 *
 * Instalación / actualización: pega este archivo en el proyecto → Implementar → Administrar implementaciones → editar → Nueva versión → Implementar.
 */
var SHEET_ID = "1D9tDfr-ABr-0PomegBH1DSnFyUXkZR4MVsGqHqvugkc";
var HOJA = "Hoja 1";
var P1 = "¿Qué esperarías que una app de finanzas hiciera por ti?";
var P1_ANTES = "¿Qué esperas que una app de finanzas hiciera por ti?";     // título anterior: si la columna ya existe con él, solo se renombra
var P2 = "¿Qué dolor te gustaría escalar?";
var ORIGEN = "Evento ignia";

// Los encabezados pueden traer espacios invisibles o mayúsculas distintas: se comparan normalizados
function norm_(t) { return String(t == null ? "" : t).replace(/[ ​‌‍﻿]/g, " ").replace(/\s+/g, " ").trim().toLowerCase(); }
function seguro_(v, max) { v = String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max || 300); return /^[=+\-@]/.test(v) ? "'" + v : v; }   // evita fórmulas
function celular_(v) {
  var d = String(v || "").replace(/\D/g, "");
  if (d.length === 10 && d.charAt(0) === "3") d = "57" + d;            // celular colombiano sin indicativo
  return d;                                                           // igual que el resto de la hoja: solo dígitos con indicativo (573209798096)
}

// Devuelve la hoja y el mapa de columnas; crea al final las de las dos preguntas si faltan (o renombra la anterior)
function preparar_() {
  var hoja = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA);
  if (!hoja) throw new Error("no encuentro la pestaña " + HOJA);
  var ultCol = Math.max(1, hoja.getLastColumn());
  var titulos = hoja.getRange(1, 1, 1, ultCol).getValues()[0].map(norm_);
  function col(n) { return titulos.indexOf(norm_(n)); }
  function asegurar(nombre, antes) {
    var c = col(nombre);
    if (c >= 0) return c;
    if (antes && col(antes) >= 0) { c = col(antes); hoja.getRange(1, c + 1).setValue(nombre); titulos[c] = norm_(nombre); return c; }
    c = titulos.length;
    hoja.getRange(1, c + 1).setValue(nombre);
    hoja.getRange(1, ultCol).copyTo(hoja.getRange(1, c + 1), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);   // mismo estilo del encabezado
    titulos.push(norm_(nombre));
    return c;
  }
  var cP1 = asegurar(P1, P1_ANTES), cP2 = asegurar(P2);
  return { hoja: hoja, titulos: titulos, col: col, cP1: cP1, cP2: cP2 };
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var etapa = Number(d.etapa || 1);
    if (!d.nombre || !d.correo || !d.respuesta || d.autorizo !== true) return out_({ ok: false, error: "faltan datos" });
    if (etapa === 2 && !d.dolor) return out_({ ok: false, error: "falta la respuesta" });
    var h = preparar_(), hoja = h.hoja, correo = seguro_(d.correo, 160), ultima = hoja.getLastRow();

    if (etapa === 2) {                                                // completa la fila más reciente de esa persona
      var cEmail = h.col("Email"), cOrigen = h.col("Origen");
      if (cEmail >= 0 && ultima > 1) {
        var desde = Math.max(2, ultima - 300 + 1);                    // basta mirar las últimas filas: es una respuesta de hace minutos
        var vals = hoja.getRange(desde, 1, ultima - desde + 1, h.titulos.length).getValues();
        for (var i = vals.length - 1; i >= 0; i--) {
          var mismo = String(vals[i][cEmail]).trim().toLowerCase() === correo.toLowerCase();
          var delEvento = cOrigen < 0 || norm_(vals[i][cOrigen]) === norm_(ORIGEN);
          if (mismo && delEvento) { hoja.getRange(desde + i, h.cP2 + 1).setValue(seguro_(d.dolor, 2000)); return out_({ ok: true, fila: desde + i }); }
        }
      }
      // No apareció la fila del paso 1 (falló ese envío): se guarda completa en una fila nueva
    }

    var fila = new Array(h.titulos.length).fill("");
    var poner = function (nombre, valor) { var c = h.col(nombre); if (c >= 0) fila[c] = valor; };
    poner("Nombre", seguro_(d.nombre, 120));
    poner("Whatsapp", celular_(d.celular));
    poner("Email", correo);
    poner("Fecha", new Date().toISOString());                         // mismo formato que las demás filas (2026-10-26T12:04:…)
    poner("Origen", ORIGEN);
    fila[h.cP1] = seguro_(d.respuesta, 2000);
    if (etapa === 2) fila[h.cP2] = seguro_(d.dolor, 2000);
    hoja.getRange(ultima + 1, 1, 1, fila.length).setValues([fila]);
    return out_({ ok: true, fila: ultima + 1 });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.accion === "palabras") {
    var clave = PropertiesService.getScriptProperties().getProperty("CLAVE_ADMIN");
    if (!clave || String(p.clave || "") !== clave) return out_({ ok: false, error: "no autorizado" });
    try {
      var h = preparar_(), hoja = h.hoja, n = hoja.getLastRow(), cOrigen = h.col("Origen");
      var p1 = [], p2 = [];
      if (n > 1) {
        var vals = hoja.getRange(2, 1, n - 1, h.titulos.length).getValues();
        vals.forEach(function (r) {
          if (cOrigen >= 0 && norm_(r[cOrigen]) !== norm_(ORIGEN)) return;     // solo lo del formulario del evento
          var a = String(r[h.cP1] || "").trim(), b = String(r[h.cP2] || "").trim();
          if (a) p1.push(a); if (b) p2.push(b);
        });
      }
      return out_({ ok: true, total: Math.max(p1.length, p2.length), p1: p1, p2: p2 });
    } catch (err) { return out_({ ok: false, error: String(err) }); }
  }
  return out_({ ok: true, service: "feminario-tu-app-de-finanzas" });
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
