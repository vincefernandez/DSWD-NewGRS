/**
 * NewGRS User System Review – registration + email-code login backend.
 *
 * Paste this whole file into the Apps Script editor of your Google Sheet
 * (Extensions → Apps Script), run setup() once, then deploy as a Web app.
 * Full steps: docs/SETUP-GUIDE.md
 *
 * Sheets used (created by setup()):
 *   Registrations : Timestamp | Full name | Email | Office | Position | Status
 *   Materials     : Name | Type | Action | URL        (only shown after sign-in)
 *
 * Security notes
 *  - No passwords are stored. Login = a 6-digit code emailed to a registered address.
 *  - Codes and sessions live in CacheService (expire automatically), not in the sheet.
 *  - Set a row's Status to "Blocked" to stop that person from signing in.
 */

const SHEET_REG = 'Registrations';
const SHEET_MAT = 'Materials';
const MAIL_SENDER_NAME = 'DSWD NewGRS Review';
const CODE_TTL = 600;        // code valid 10 minutes
const SESSION_TTL = 21600;   // session valid 6 hours (CacheService maximum)
const RESEND_COOLDOWN = 60;  // seconds between code requests per email
const MAX_ATTEMPTS = 5;      // wrong codes allowed per code

/* ------------------------------------------------------------------ */
/* One-time setup – run this once from the editor (Run ▶ setup)        */
/* ------------------------------------------------------------------ */
function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('Asia/Manila');

  let reg = ss.getSheetByName(SHEET_REG);
  if (!reg) reg = ss.insertSheet(SHEET_REG);
  if (reg.getLastRow() === 0) {
    reg.appendRow(['Timestamp', 'Full name', 'Email', 'Office', 'Position', 'Status']);
    reg.setFrozenRows(1);
    reg.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  let mat = ss.getSheetByName(SHEET_MAT);
  if (!mat) mat = ss.insertSheet(SHEET_MAT);
  if (mat.getLastRow() === 0) {
    mat.appendRow(['Name', 'Type', 'Action', 'URL']);
    mat.appendRow(['NewGRS Manual.pdf', 'pdf', 'Download Manual', 'https://drive.google.com/']);
    mat.appendRow(['NewGRS Slides.pptx', 'pptx', 'Download Slides', 'https://drive.google.com/']);
    mat.appendRow(['Simulation Dataset.xlsx', 'xlsx', 'Download File', 'https://drive.google.com/']);
    mat.setFrozenRows(1);
    mat.getRange(1, 1, 1, 4).setFontWeight('bold');
  }

  const blank = ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1 && blank.getLastRow() === 0) ss.deleteSheet(blank);
}

/* ------------------------------------------------------------------ */
/* Web app entry points                                                */
/* ------------------------------------------------------------------ */
function doGet() {
  return json_({ ok: true, message: 'NewGRS API is running.' });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (body.action) {
      case 'register':    return json_(register_(body));
      case 'requestCode': return json_(requestCode_(body));
      case 'verifyCode':  return json_(verifyCode_(body));
      case 'materials':   return json_(materials_(body));
      case 'logout':      return json_(logout_(body));
      default:            return json_({ ok: false, error: 'Unknown action.' });
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong. Please try again.' });
  }
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */
function register_(b) {
  const name = clean_(b.fullname, 120);
  const email = normEmail_(b.email);
  const office = clean_(b.office, 120);
  const position = clean_(b.position, 120);

  if (!name || !office || !position || !isEmail_(email)) {
    return { ok: false, error: 'Please complete all fields with a valid email address.' };
  }
  if (b.consent !== true) {
    return { ok: false, error: 'Please accept the data privacy consent.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_(SHEET_REG);
    if (findRow_(sh, email) > 0) {
      return { ok: true, already: true, message: 'This email is already registered. You can sign in now.' };
    }
    sh.appendRow([new Date(), safeCell_(name), email, safeCell_(office), safeCell_(position), 'Registered']);
    return { ok: true, message: 'You are registered. Use "Sign in" to access the materials.' };
  } finally {
    lock.releaseLock();
  }
}

function requestCode_(b) {
  const email = normEmail_(b.email);
  if (!isEmail_(email)) return { ok: false, error: 'Enter a valid email address.' };

  const cache = CacheService.getScriptCache();
  if (cache.get('cool:' + email)) {
    return { ok: false, error: 'Please wait a minute before requesting another code.' };
  }
  cache.put('cool:' + email, '1', RESEND_COOLDOWN);

  // Same reply whether or not the email is registered, so the list can't be probed.
  const reply = {
    ok: true,
    message: 'If this email is registered, a 6-digit code has been sent. It expires in 10 minutes.',
  };

  const sh = sheet_(SHEET_REG);
  const row = findRow_(sh, email);
  if (row < 0) return reply;
  if (String(sh.getRange(row, 6).getValue()).trim().toLowerCase() === 'blocked') return reply;

  const code = makeCode_();
  cache.put('otp:' + email, JSON.stringify({ h: hash_(email + ':' + code), n: 0 }), CODE_TTL);
  MailApp.sendEmail({
    to: email,
    name: MAIL_SENDER_NAME,
    subject: 'Your NewGRS sign-in code: ' + code,
    body:
      'Your sign-in code is ' + code + '\n\n' +
      'It is valid for 10 minutes. If you did not request it, you can ignore this email.\n\n' +
      'NewGRS User System Review – Region III',
  });
  return reply;
}

function verifyCode_(b) {
  const email = normEmail_(b.email);
  const code = String(b.code || '').trim();
  if (!isEmail_(email) || !/^\d{6}$/.test(code)) {
    return { ok: false, error: 'Enter the 6-digit code from your email.' };
  }

  const cache = CacheService.getScriptCache();
  const raw = cache.get('otp:' + email);
  if (!raw) return { ok: false, error: 'This code has expired or was not requested. Request a new one.' };

  const otp = JSON.parse(raw);
  if (otp.n >= MAX_ATTEMPTS) {
    cache.remove('otp:' + email);
    return { ok: false, error: 'Too many wrong attempts. Request a new code.' };
  }
  if (otp.h !== hash_(email + ':' + code)) {
    otp.n += 1;
    cache.put('otp:' + email, JSON.stringify(otp), CODE_TTL);
    return { ok: false, error: 'Incorrect code. Please try again.' };
  }

  cache.remove('otp:' + email);
  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  cache.put('sess:' + token, email, SESSION_TTL);

  const sh = sheet_(SHEET_REG);
  const row = findRow_(sh, email);
  const name = row > 0 ? String(sh.getRange(row, 2).getValue()) : '';
  return { ok: true, token: token, name: name };
}

function materials_(b) {
  const email = emailForToken_(b.token);
  if (!email) return { ok: false, expired: true, error: 'Session expired. Please sign in again.' };

  const sh = sheet_(SHEET_MAT);
  const last = sh.getLastRow();
  const list = [];
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, 4).getValues().forEach(function (r) {
      const url = String(r[3]).trim();
      if (r[0] && /^https:\/\//i.test(url)) {
        list.push({ name: String(r[0]), type: String(r[1] || '').toLowerCase(), action: String(r[2] || 'Download'), href: url });
      }
    });
  }
  return { ok: true, materials: list };
}

function logout_(b) {
  if (b.token) CacheService.getScriptCache().remove('sess:' + String(b.token));
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function sheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Missing sheet "' + name + '". Run setup() first.');
  return sh;
}

function findRow_(sh, email) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const vals = sh.getRange(2, 3, last - 1, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toLowerCase() === email) return i + 2;
  }
  return -1;
}

function emailForToken_(token) {
  if (!token || typeof token !== 'string' || token.length < 40 || token.length > 100) return null;
  return CacheService.getScriptCache().get('sess:' + token);
}

function makeCode_() {
  const n = parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 8), 16) % 1000000;
  return ('000000' + n).slice(-6);
}

function hash_(s) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s));
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

function normEmail_(v) {
  return clean_(v, 100).toLowerCase();
}

function isEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 100;
}

// Stops spreadsheet formula injection (a value starting with = + - @ would run as a formula).
function safeCell_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
