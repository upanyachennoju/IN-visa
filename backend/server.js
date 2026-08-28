// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database (file-based)
const db = new Database('data/visa_flow.db');

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tempId TEXT UNIQUE,
  finalReferenceNumber TEXT,
  applicant_references TEXT,
  json TEXT
);
CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applicationId TEXT,
  emailOtp TEXT,
  phoneOtp TEXT,
  UNIQUE(applicationId)
);
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tempId TEXT,
  sectionName TEXT,
  data TEXT,
  UNIQUE(tempId, sectionName)
);
`);

// Helper to upsert a JSON field for an application
function upsertApplication(tempId, updates) {
  const existing = db.prepare('SELECT json FROM applications WHERE tempId = ?').get(tempId);
  let appData = {};
  if (existing && existing.json) {
    try { appData = JSON.parse(existing.json); } catch (e) { appData = {}; }
  }
  Object.assign(appData, updates);
  const jsonStr = JSON.stringify(appData);
  const stmt = db.prepare('INSERT INTO applications (tempId, json) VALUES (?, ?) ON CONFLICT(tempId) DO UPDATE SET json = excluded.json');
  stmt.run(tempId, jsonStr);
}

// ---------- Contact Endpoints ----------
app.post('/api/contact', (req, res) => {
  // Create a new draft application and return tempId
  const tempId = uuidv4();
  const stmt = db.prepare('INSERT INTO applications (tempId, json) VALUES (?, ?)');
  stmt.run(tempId, JSON.stringify({}));
  res.json({ tempId });
});

app.post('/api/contact/:applicationId/otp/email', (req, res) => {
  const { applicationId } = req.params;
  const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const stmt = db.prepare('INSERT INTO otps (applicationId, emailOtp) VALUES (?, ?) ON CONFLICT(applicationId) DO UPDATE SET emailOtp = excluded.emailOtp');
  stmt.run(applicationId, emailOtp);
  // Mock dispatch – just log
  console.log(`Mock email OTP for ${applicationId}: ${emailOtp}`);
  res.json({ message: 'Email OTP sent' });
});

app.post('/api/contact/:applicationId/otp/phone', (req, res) => {
  const { applicationId } = req.params;
  const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const stmt = db.prepare('INSERT INTO otps (applicationId, phoneOtp) VALUES (?, ?) ON CONFLICT(applicationId) DO UPDATE SET phoneOtp = excluded.phoneOtp');
  stmt.run(applicationId, phoneOtp);
  console.log(`Mock phone OTP for ${applicationId}: ${phoneOtp}`);
  res.json({ message: 'Phone OTP sent' });
});

app.post('/api/contact/:applicationId/verify', (req, res) => {
  const { applicationId } = req.params;
  const { emailOtp, phoneOtp } = req.body;
  const row = db.prepare('SELECT emailOtp, phoneOtp FROM otps WHERE applicationId = ?').get(applicationId);
  const emailValid = emailOtp && row && row.emailOtp === emailOtp;
  const phoneValid = phoneOtp && row && row.phoneOtp === phoneOtp;
  const response = {
    emailVerified: emailValid,
    phoneVerified: phoneValid,
    success: emailValid && phoneValid
  };
  // Update contact verification flags in application json if needed
  if (response.success) {
    upsertApplication(applicationId, { contactVerified: true });
  }
  res.json(response);
});

// ---------- Application Section Endpoints ----------
const sectionNames = [
  'application-context',
  'identity',
  'passport',
  'contact',
  'address',
  'family',
  'occupation',
  'visa-trip',
  'previous-india-travel',
  'travel-history',
  'references',
  'background-answers'
];

sectionNames.forEach(section => {
  app.post(`/api/applications/${section}`, (req, res) => {
    const data = req.body;
    const tempId = data.tempId || uuidv4(); // allow client to send tempId or generate new one
    // Store raw payload for the section
    const stmt = db.prepare('INSERT INTO sections (tempId, sectionName, data) VALUES (?, ?, ?) ON CONFLICT(tempId, sectionName) DO UPDATE SET data = excluded.data');
    stmt.run(tempId, section, JSON.stringify(data));
    // Also upsert top‑level fields that exist in this section (e.g., applicant_references)
    if (section === 'application-context' && data.applicantReferences !== undefined) {
      // rename to snake_case column
      upsertApplication(tempId, { applicant_references: data.applicantReferences });
    }
    res.json({ tempId, saved: true });
  });
});

// ---------- State Retrieval ----------
app.get('/api/applications/:tempId', (req, res) => {
  const { tempId } = req.params;
  const appRow = db.prepare('SELECT json FROM applications WHERE tempId = ?').get(tempId);
  const sectionsRows = db.prepare('SELECT sectionName, data FROM sections WHERE tempId = ?').all(tempId);
  const response = {
    application: appRow ? JSON.parse(appRow.json) : null,
    sections: sectionsRows.reduce((acc, cur) => {
      acc[cur.sectionName] = JSON.parse(cur.data);
      return acc;
    }, {})
  };
  res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VisaFlow backend listening on port ${PORT}`));
