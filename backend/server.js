// server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  require('dotenv').config();
} catch (e) {}
const MODEL_NAME = process.env.MODEL_NAME || 'openai/gpt-4o-mini';
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database (file-based)
const db = new Database(path.resolve(__dirname, process.env.VISA_DB_PATH || 'data/visa_flow.db'));

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

const sectionConfig = {
  'application-context': { property: 'applicationContext', key: 'APPLICATION_CONTEXT' }, identity: { property: 'identity', key: 'IDENTITY' }, passport: { property: 'passport', key: 'PASSPORT' }, contact: { property: 'contact', key: 'CONTACT' }, address: { property: 'address', key: 'ADDRESS' }, family: { property: 'family', key: 'FAMILY' }, occupation: { property: 'occupation', key: 'OCCUPATION' }, 'visa-trip': { property: 'visaTrip', key: 'VISA_TRIP' }, 'previous-india-travel': { property: 'previousIndiaTravel', key: 'PREVIOUS_INDIA_TRAVEL' }, 'travel-history': { property: 'travelHistory', key: 'TRAVEL_HISTORY' }, references: { property: 'references', key: 'REFERENCES' }, 'background-answers': { property: 'backgroundAnswers', key: 'BACKGROUND_ANSWERS' },
};
const sectionOrder = ['APPLICATION_CONTEXT', 'IDENTITY', 'PASSPORT', 'CONTACT', 'ADDRESS', 'FAMILY', 'OCCUPATION', 'VISA_TRIP', 'PREVIOUS_INDIA_TRAVEL', 'TRAVEL_HISTORY', 'REFERENCES', 'BACKGROUND_ANSWERS', 'DOCUMENTS', 'PHOTO_STATUS', 'SUBMISSION'];

function readApplicationState(tempId) {
  const row = db.prepare('SELECT id, json FROM applications WHERE tempId = ?').get(tempId);
  if (!row) return null;
  let application = {};
  try { application = JSON.parse(row.json || '{}'); } catch (e) { application = {}; }
  for (const section of db.prepare('SELECT sectionName, data FROM sections WHERE tempId = ?').all(tempId)) {
    const config = sectionConfig[section.sectionName];
    if (!config) continue;
    try { application[config.property] = JSON.parse(section.data); } catch (e) { /* ignore malformed legacy data */ }
  }
  return { ...application, applicationId: String(row.id), tempId, currentSection: application.currentSection || 'APPLICATION_CONTEXT', completedSections: application.completedSections || [], applicationStatus: application.applicationStatus || 'DRAFT' };
}

function saveSection(tempId, section, data) {
  const config = sectionConfig[section];
  if (!config) return null;
  const current = readApplicationState(tempId);
  const completedSections = new Set(current?.completedSections || []);
  completedSections.add(config.key);
  const index = sectionOrder.indexOf(config.key);
  const currentSection = index >= 0 && index < sectionOrder.length - 1 ? sectionOrder[index + 1] : config.key;
  upsertApplication(tempId, { currentSection, completedSections: [...completedSections], applicationStatus: current?.applicationStatus || 'DRAFT' });
  db.prepare('INSERT INTO sections (tempId, sectionName, data) VALUES (?, ?, ?) ON CONFLICT(tempId, sectionName) DO UPDATE SET data = excluded.data').run(tempId, section, JSON.stringify({ ...data, tempId }));
  return readApplicationState(tempId);
}

// ---------- Contact Endpoints ----------
app.post('/api/contact', (req, res) => {
  const tempId = req.body?.tempId || uuidv4();
  if (!readApplicationState(tempId)) upsertApplication(tempId, { currentSection: 'CONTACT', completedSections: [], applicationStatus: 'DRAFT' });
  const state = saveSection(tempId, 'contact', { email: req.body?.email || '', countryCode: req.body?.countryCode || '', phone: req.body?.phone || '', emailVerified: false, phoneVerified: false });
  res.json({ ...state, email: state.contact.email, countryCode: state.contact.countryCode, phone: state.contact.phone });
});

app.post('/api/contact/:applicationId/otp/email', (req, res) => {
  const { applicationId } = req.params;
  const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const stmt = db.prepare('INSERT INTO otps (applicationId, emailOtp) VALUES (?, ?) ON CONFLICT(applicationId) DO UPDATE SET emailOtp = excluded.emailOtp');
  stmt.run(applicationId, emailOtp);
  // Mock dispatch – just log
  console.log(`Mock email OTP for ${applicationId}: ${emailOtp}`);
  res.json({ message: 'Email OTP sent', otp: emailOtp });
});

app.post('/api/contact/:applicationId/otp/phone', (req, res) => {
  const { applicationId } = req.params;
  const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const stmt = db.prepare('INSERT INTO otps (applicationId, phoneOtp) VALUES (?, ?) ON CONFLICT(applicationId) DO UPDATE SET phoneOtp = excluded.phoneOtp');
  stmt.run(applicationId, phoneOtp);
  console.log(`Mock phone OTP for ${applicationId}: ${phoneOtp}`);
  res.json({ message: 'Phone OTP sent', otp: phoneOtp });
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
    const applicationRow = db.prepare('SELECT tempId FROM applications WHERE id = ?').get(applicationId);
    if (applicationRow) {
      const state = readApplicationState(applicationRow.tempId);
      saveSection(applicationRow.tempId, 'contact', { ...state.contact, emailVerified: true, phoneVerified: true });
      return res.json({ ...response, ...readApplicationState(applicationRow.tempId), dispatchLog: [] });
    }
  }
  res.json({ ...response, dispatchLog: [] });
});

// ---------- Application Section Endpoints ----------
app.post('/api/applications/application-context', (req, res) => {
  const tempId = req.body?.tempId || uuidv4();
  res.json(saveSection(tempId, 'application-context', req.body || {}));
});
app.post('/api/applications/:tempId/:section', (req, res, next) => {
  const { tempId, section } = req.params;
  if (section === 'submit') return next();
  if (!sectionConfig[section]) return res.status(404).json({ error: 'Unknown application section' });
  if (!readApplicationState(tempId)) return res.status(404).json({ error: 'Application not found' });
  res.json(saveSection(tempId, section, req.body || {}));
});

// ---------- State Retrieval ----------
app.get('/api/applications/:tempId', (req, res) => {
  const { tempId } = req.params;
  const state = readApplicationState(tempId);
  if (!state) return res.status(404).json({ error: 'Application not found' });
  res.json(state);
});

// ---------- Photo Quality Checker Endpoint ----------
app.post('/api/documents/photo-check', upload.single('image'), async (req, res) => {
  try {
    const { tempId } = req.body;
    if (!tempId) {
      return res.status(400).json({ error: 'tempId is required' });
    }
    const appExists = db.prepare('SELECT 1 FROM applications WHERE tempId = ?').get(tempId);
    if (!appExists) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    const imageBase64 = req.file.buffer.toString('base64');
    const prompt = `You are an automated photo quality checker for visa applications. Analyze the uploaded image and return a JSON object with the following boolean fields and a string field:\n{\n  "faceVisible": bool,\n  "faceCentered": bool,\n  "backgroundPlain": bool,\n  "resolutionAdequate": bool,\n  "hasBlurOrGlare": bool,\n  "overallPass": bool,\n  "fixInstruction": string\n}\nProvide ONLY the JSON. Do NOT add any extra commentary.`;

    const openAiPromise = openai.chat.completions.create({
      model: MODEL_NAME,
      max_tokens: 500,
      temperature: 0,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that returns strict JSON as described.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ]
    });

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    const result = await Promise.race([openAiPromise, timeoutPromise]);
    const message = result.choices[0].message;
    let data;
    try {
      data = JSON.parse(message.content);
    } catch (e) {
      throw new Error('Invalid JSON from model');
    }
    if (typeof data.overallPass !== 'boolean') {
      data.overallPass = false;
    }
    res.json(data);
  } catch (err) {
    res.json({
      faceVisible: false,
      faceCentered: false,
      backgroundPlain: false,
      resolutionAdequate: false,
      hasBlurOrGlare: false,
      overallPass: false,
      fixInstruction: "We couldn't check your photo automatically — please make sure your face is clearly visible against a plain background."
    });
  }
});

// ---------- Plain-Language Error Explainer Endpoint ----------
app.post('/api/explain-error', async (req, res) => {
  const { field, error, context } = req.body || {};
  if (!error) {
    return res.status(400).json({ error: 'Raw error message is required' });
  }

  try {
    const prompt = `You are an automated assistant for a visa application form. An applicant got a validation error on the field "${field || 'form field'}" (context: "${context || ''}").
Raw error message: "${error}"
Explain in ONE short, non-technical, simple sentence how the applicant can fix this error.
Output ONLY strict JSON in the format: {"message": "string"}`;

    const openAiPromise = openai.chat.completions.create({
      model: MODEL_NAME,
      max_tokens: 150,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You explain form validation errors simply and concisely. Output strict JSON only.' },
        { role: 'user', content: prompt }
      ]
    });

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    const result = await Promise.race([openAiPromise, timeoutPromise]);
    const responseText = result.choices[0].message.content;
    const parsed = JSON.parse(responseText);
    res.json({ message: parsed.message || error });
  } catch (err) {
    // Fallback: return raw validation error message if AI call fails or times out
    res.json({ message: error });
  }
});

// ---------- Application Submit Endpoint ----------
app.post('/api/applications/:tempId/submit', (req, res) => {
  const { tempId } = req.params;
  const appRow = db.prepare('SELECT json FROM applications WHERE tempId = ?').get(tempId);
  if (!appRow) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const sectionsRows = db.prepare('SELECT sectionName, data FROM sections WHERE tempId = ?').all(tempId);
  const sections = sectionsRows.reduce((acc, cur) => {
    try { acc[cur.sectionName] = JSON.parse(cur.data); } catch (e) { }
    return acc;
  }, {});

  const errors = [];
  const contextData = sections['application-context'] || {};
  const identityData = sections['identity'] || {};
  const visaTripData = sections['visa-trip'] || {};

  // Cross-Field Consistency Checks
  if (contextData.dateOfBirth && identityData.dob && contextData.dateOfBirth !== identityData.dob) {
    errors.push(`Date of Birth mismatch: Application Context has "${contextData.dateOfBirth}" but Identity section has "${identityData.dob}".`);
  }

  if (contextData.portOfArrival && visaTripData.portOfArrival && contextData.portOfArrival.trim().toLowerCase() !== visaTripData.portOfArrival.trim().toLowerCase()) {
    errors.push(`Port of Arrival mismatch: Application Context has "${contextData.portOfArrival}" but Visa Trip section has "${visaTripData.portOfArrival}".`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Generate synthetic final reference number: IND-XXXXXX
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const finalReferenceNumber = `IND-${randomStr}`;

  upsertApplication(tempId, {
    applicationStatus: 'SUBMITTED',
    finalReferenceNumber,
    submittedAt: new Date().toISOString()
  });

  const stmt = db.prepare('UPDATE applications SET finalReferenceNumber = ? WHERE tempId = ?');
  stmt.run(finalReferenceNumber, tempId);

  res.json({
    success: true,
    tempId,
    finalReferenceNumber,
    applicationStatus: 'SUBMITTED'
  });
});

// Helper for Wait-Time Estimate
function getWaitTimeEstimate(visaType, purpose) {
  const key = `${visaType || ''} ${purpose || ''}`.toLowerCase();
  if (key.includes('medical')) return '1-2 business days';
  if (key.includes('business')) return '2-4 business days';
  if (key.includes('conference')) return '3-5 business days';
  return '3-5 business days';
}

// ---------- Application Status Explainer Endpoint ----------
app.get('/api/status/:finalReferenceNumber', async (req, res) => {
  const { finalReferenceNumber } = req.params;

  let appRow = db.prepare('SELECT tempId, json FROM applications WHERE finalReferenceNumber = ?').get(finalReferenceNumber);
  if (!appRow) {
    appRow = db.prepare('SELECT tempId, json FROM applications WHERE tempId = ?').get(finalReferenceNumber);
  }

  if (!appRow) {
    return res.status(404).json({ error: 'No application found with that reference number' });
  }

  let appData = {};
  try { appData = JSON.parse(appRow.json); } catch (e) { }

  const tempId = appRow.tempId;
  const status = appData.applicationStatus || 'SUBMITTED';

  const sectionsRows = db.prepare('SELECT sectionName, data FROM sections WHERE tempId = ?').all(tempId);
  const sections = sectionsRows.reduce((acc, cur) => {
    try { acc[cur.sectionName] = JSON.parse(cur.data); } catch (e) { }
    return acc;
  }, {});

  const contextData = sections['application-context'] || {};
  const visaTripData = sections['visa-trip'] || {};

  const visaType = visaTripData.visaType || contextData.passportType || '';
  const visaPurpose = visaTripData.purpose || contextData.visaPurpose || '';
  const waitTimeEstimate = getWaitTimeEstimate(visaType, visaPurpose);

  let explanation = 'Your application has been received and is currently being processed by visa authorities.';

  try {
    const prompt = `You are a helpful and reassuring visa status assistant for citizens. An applicant's visa application currently has the internal status "${status}".
Provide ONE warm, clear, citizen-focused sentence explaining what this status means and reassuring them about what to expect next.
Output ONLY strict JSON in format: {"explanation": "string"}`;

    const openAiPromise = openai.chat.completions.create({
      model: MODEL_NAME,
      max_tokens: 150,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You explain visa status enums in warm, clear, non-technical plain English. Output strict JSON only.' },
        { role: 'user', content: prompt }
      ]
    });

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    const result = await Promise.race([openAiPromise, timeoutPromise]);
    const responseText = result.choices[0].message.content;
    const parsed = JSON.parse(responseText);
    if (parsed.explanation) {
      explanation = parsed.explanation;
    }
  } catch (err) {
    // Fallback message used if AI call fails or times out
  }

  res.json({
    finalReferenceNumber: appData.finalReferenceNumber || finalReferenceNumber,
    tempId,
    applicationStatus: status,
    explanation,
    waitTimeEstimate,
    submittedAt: appData.submittedAt || new Date().toISOString()
  });
});

// Serve React frontend
const frontendPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(frontendPath));

// React Router fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VisaFlow backend listening on port ${PORT}`));
