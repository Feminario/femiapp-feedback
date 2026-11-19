/**
 * Feminario — Tu app de Finanzas (formulario del evento)
 * Hoja: «LEADS CLUB 365 - 3RA COHORTE» (pestaña «Hoja 1»). Todo lo que llega por el formulario lleva Origen = «Evento ignia».
 *  · PASO 1 (etapa 1): fila NUEVA con Nombre, Whatsapp, Email, Fecha, Origen y la respuesta a «¿Qué esperarías que una app de finanzas hiciera por ti?».
 *  · PASO 2 (etapa 2): completa ESA misma fila (la más reciente con ese correo y ese origen) con «¿Qué dolor te gustaría escalar?».
 * Las columnas se buscan por su encabezado; las dos de preguntas se crean al final la primera vez. No se toca ninguna otra columna.
 *
 * PANEL /admin (nube, sin clave): GET ?accion=palabras devuelve las respuestas a «¿Qué dolor te gustaría escalar?» TAL CUAL las escribieron
 * (sin nombres, correos ni celulares), de las filas con Origen «Evento ignia».
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
function norm_(t) { return String(t == null ? "" : t).replace(/[\u00a0\u200b\u200c\u200d\ufeff]/g, " ").replace(/\s+/g, " ").trim().toLowerCase(); }
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

var STOP = {};
("a al algo algun alguna algunas alguno algunos ante antes aqui asi aun aunque bien cada casi como con contra cosas cual cuando de del desde donde dos e el ella ellas ello ellos en entre era eran es esa esas ese eso esos esta estan estar este esto estos fue fueron ha hace hacen hacer hacia han hasta hay hoy la las le les lo los mas me mi mis misma mismo mucho muchos muy nada ni no nos nuestra nuestro o otra otras otro otros para pero poco por porque pues que quien se sea ser si sido sin sobre solo su sus tambien tan tanto te tener tengo tiene tienen todo todas todos tu tus un una uno unos usted y ya yo quiero quisiera queria gustaria esperaria esperarias seria podria pudiera puedo pueda puedan poder deberia debe hiciera hacerlo hacerme haga hagan ayude ayudara ayudaria ayudar app apps aplicacion aplicaciones finanzas finanza persona personas cosa vez veces manera forma tipo parte ahora siempre nunca ademas aca ahi entonces mejor vida dia dias").split(" ").forEach(function (w) { STOP[w] = 1; });
function sinTilde_(t) { return t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

// Cuenta palabras (sin conectores). Devuelve [[palabra, veces], …]: nunca las frases completas
function palabras_(textos) {
  var cuenta = {}, forma = {};
  textos.forEach(function (t) {
    (String(t).toLowerCase().match(/[a-záéíóúüñ]+/g) || []).forEach(function (w) {
      var k = sinTilde_(w);
      if (k.length < 3 || STOP[k]) return;
      cuenta[k] = (cuenta[k] || 0) + 1;
      forma[k] = forma[k] || {}; forma[k][w] = (forma[k][w] || 0) + 1;
    });
  });
  return Object.keys(cuenta).map(function (k) {
    var f = Object.keys(forma[k]).sort(function (a, b) { return forma[k][b] - forma[k][a]; })[0];
    return [f, cuenta[k]];
  }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 150);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.accion === "palabras") {                                      // panel /admin: abierto, pero SOLO devuelve conteos de palabras (sin frases, nombres, correos ni celulares)
    try {
      var h = preparar_(), hoja = h.hoja, n = hoja.getLastRow(), cOrigen = h.col("Origen");
      var t2 = [];                                                                 // solo los dolores de la última pregunta
      if (n > 1) {
        hoja.getRange(2, 1, n - 1, h.titulos.length).getValues().forEach(function (r) {
          if (cOrigen >= 0 && norm_(r[cOrigen]) !== norm_(ORIGEN)) return;     // solo lo del formulario del evento
          var b = String(r[h.cP2] || "").trim();
          if (b) t2.push(b);
        });
      }
      return out_({ ok: true, n: t2.length, r: t2, p: palabras_(t2) });   // r = las respuestas tal cual las escribieron (sin nombres, correos ni celulares)
    } catch (err) { return out_({ ok: false, error: String(err) }); }
  }
  return out_({ ok: true, service: "feminario-tu-app-de-finanzas" });
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
