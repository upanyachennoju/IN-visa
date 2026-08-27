import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8080/api';

const SECTION_STEPS = [
  { key: 'APPLICATION_CONTEXT', label: 'Application Context' },
  { key: 'IDENTITY', label: 'Identity' },
  { key: 'PASSPORT', label: 'Passport' },
  { key: 'CONTACT', label: 'Contact' },
  { key: 'ADDRESS', label: 'Address' },
  { key: 'FAMILY', label: 'Family' },
  { key: 'OCCUPATION', label: 'Occupation' },
  { key: 'VISA_TRIP', label: 'Visa Trip' },
  { key: 'PREVIOUS_INDIA_TRAVEL', label: 'Previous India Travel' },
  { key: 'TRAVEL_HISTORY', label: 'Travel History' },
  { key: 'REFERENCES', label: 'References' },
  { key: 'BACKGROUND_ANSWERS', label: 'Background Answers' },
  { key: 'DOCUMENTS', label: 'Documents' },
  { key: 'PHOTO_STATUS', label: 'Photo Status' },
  { key: 'SUBMISSION', label: 'Submission' },
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PASSPORT_RE = /^VF-[A-Z0-9]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{6,15}$/;
const COUNTRY_CODE_RE = /^\+\d{1,3}$/;

const EMPTY_APPLICATION = {
  applicationId: null,
  tempId: '',
  currentSection: 'APPLICATION_CONTEXT',
  completedSections: [],
  applicationStatus: 'DRAFT',
  applicationContext: null,
  identity: null,
  passport: null,
  contact: null,
};

const EMPTY_CONTEXT_FORM = {
  tempId: '',
  countryApplyingFrom: '',
  indianMission: '',
  nationality: '',
  passportType: '',
  portOfArrival: '',
  expectedArrivalDate: '',
  dateOfBirth: '',
  visaPurpose: '',
};

const EMPTY_IDENTITY_FORM = {
  firstName: '',
  lastName: '',
  previousName: '',
  gender: '',
  dob: '',
  cityOfBirth: '',
  countryOfBirth: '',
  citizenshipId: '',
  religion: '',
  identificationMark: '',
  education: '',
  nationality: '',
  nationalityAcquiredBy: '',
  residenceHistory: '',
};

const EMPTY_PASSPORT_FORM = {
  number: '',
  placeOfIssue: '',
  dateOfIssue: '',
  dateOfExpiry: '',
  hasAdditionalPassport: false,
  additionalPassportDetails: '',
};

const EMPTY_CONTACT_FORM = {
  email: '',
  confirmEmail: '',
  countryCode: '+91',
  phone: '',
};

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('resume')) {
    return { view: 'resume' };
  }
  if (hash.startsWith('app/')) {
    return { view: 'app', tempId: decodeURIComponent(hash.slice(4)) };
  }
  return { view: 'shell' };
}

function normalizeResponse(data) {
  return {
    applicationId: data.applicationId ?? null,
    tempId: data.tempId ?? '',
    currentSection: data.currentSection || 'APPLICATION_CONTEXT',
    completedSections: data.completedSections || [],
    applicationStatus: data.applicationStatus || 'DRAFT',
    applicationContext: data.applicationContext || null,
    identity: data.identity || null,
    passport: data.passport || null,
    contact: data.contact || null,
  };
}

function buildContextForm(application) {
  const context = application.applicationContext || {};
  return {
    tempId: application.tempId || '',
    countryApplyingFrom: context.countryApplyingFrom || '',
    indianMission: context.indianMission || '',
    nationality: context.nationality || '',
    passportType: context.passportType || '',
    portOfArrival: context.portOfArrival || '',
    expectedArrivalDate: context.expectedArrivalDate || '',
    dateOfBirth: context.dateOfBirth || '',
    visaPurpose: context.visaPurpose || '',
  };
}

function buildIdentityForm(application) {
  const identity = application.identity || {};
  return {
    firstName: identity.firstName || '',
    lastName: identity.lastName || '',
    previousName: identity.previousName || '',
    gender: identity.gender || '',
    dob: identity.dob || '',
    cityOfBirth: identity.cityOfBirth || '',
    countryOfBirth: identity.countryOfBirth || '',
    citizenshipId: identity.citizenshipId || '',
    religion: identity.religion || '',
    identificationMark: identity.identificationMark || '',
    education: identity.education || '',
    nationality: identity.nationality || '',
    nationalityAcquiredBy: identity.nationalityAcquiredBy || '',
    residenceHistory: Array.isArray(identity.residenceHistory) ? identity.residenceHistory.join(', ') : '',
  };
}

function buildPassportForm(application) {
  const passport = application.passport || {};
  return {
    number: passport.number || '',
    placeOfIssue: passport.placeOfIssue || '',
    dateOfIssue: passport.dateOfIssue || '',
    dateOfExpiry: passport.dateOfExpiry || '',
    hasAdditionalPassport: Boolean(passport.hasAdditionalPassport),
    additionalPassportDetails: passport.additionalPassportDetails || '',
  };
}

function buildContactForm(application) {
  const contact = application.contact || {};
  return {
    applicationId: application.applicationId || null,
    email: contact.email || '',
    confirmEmail: contact.email || '',
    countryCode: contact.countryCode || '+91',
    phone: contact.phone || '',
  };
}

function validateContextForm(form) {
  const errors = {};
  if (!form.countryApplyingFrom.trim()) errors.countryApplyingFrom = 'Required.';
  if (!form.indianMission.trim()) errors.indianMission = 'Required.';
  if (!form.nationality.trim()) errors.nationality = 'Required.';
  if (!form.passportType.trim()) errors.passportType = 'Required.';
  if (!form.portOfArrival.trim()) errors.portOfArrival = 'Required.';
  if (!DATE_RE.test(form.expectedArrivalDate)) errors.expectedArrivalDate = 'Use YYYY-MM-DD.';
  if (!DATE_RE.test(form.dateOfBirth)) errors.dateOfBirth = 'Use YYYY-MM-DD.';
  if (!form.visaPurpose.trim()) errors.visaPurpose = 'Required.';
  return errors;
}

function validateIdentityForm(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'Required.';
  if (!form.lastName.trim()) errors.lastName = 'Required.';
  if (!form.gender.trim()) errors.gender = 'Required.';
  if (!DATE_RE.test(form.dob)) errors.dob = 'Use YYYY-MM-DD.';
  if (!form.cityOfBirth.trim()) errors.cityOfBirth = 'Required.';
  if (!form.countryOfBirth.trim()) errors.countryOfBirth = 'Required.';
  if (!form.citizenshipId.trim()) errors.citizenshipId = 'Required.';
  if (!form.religion.trim()) errors.religion = 'Required.';
  if (!form.identificationMark.trim()) errors.identificationMark = 'Required.';
  if (!form.education.trim()) errors.education = 'Required.';
  if (!form.nationality.trim()) errors.nationality = 'Required.';
  if (!form.nationalityAcquiredBy.trim()) errors.nationalityAcquiredBy = 'Required.';
  if (!form.residenceHistory.trim()) errors.residenceHistory = 'Required.';
  return errors;
}

function validatePassportForm(form) {
  const errors = {};
  if (!PASSPORT_RE.test(form.number.trim())) errors.number = 'Use the synthetic format VF-XXXXXX.';
  if (!form.placeOfIssue.trim()) errors.placeOfIssue = 'Required.';
  if (!DATE_RE.test(form.dateOfIssue)) errors.dateOfIssue = 'Use YYYY-MM-DD.';
  if (!DATE_RE.test(form.dateOfExpiry)) errors.dateOfExpiry = 'Use YYYY-MM-DD.';
  return errors;
}

function validateContactForm(form) {
  const errors = {};
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email.';
  if (form.email.trim() !== form.confirmEmail.trim()) errors.confirmEmail = 'Emails must match.';
  if (!COUNTRY_CODE_RE.test(form.countryCode.trim())) errors.countryCode = 'Use + and 1-3 digits.';
  if (!PHONE_RE.test(form.phone.trim())) errors.phone = 'Use 6-15 digits.';
  return errors;
}

function sectionLabel(key) {
  return SECTION_STEPS.find((step) => step.key === key)?.label || 'Section';
}

function nextSection(key) {
  const index = SECTION_STEPS.findIndex((step) => step.key === key);
  return index >= 0 && index < SECTION_STEPS.length - 1 ? SECTION_STEPS[index + 1].key : key;
}

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [application, setApplication] = useState(EMPTY_APPLICATION);
  const [activeSection, setActiveSection] = useState('APPLICATION_CONTEXT');
  const [contextForm, setContextForm] = useState(EMPTY_CONTEXT_FORM);
  const [identityForm, setIdentityForm] = useState(EMPTY_IDENTITY_FORM);
  const [passportForm, setPassportForm] = useState(EMPTY_PASSPORT_FORM);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    APPLICATION_CONTEXT: {},
    IDENTITY: {},
    PASSPORT: {},
    CONTACT: {},
  });
  const [simulatedOtps, setSimulatedOtps] = useState({ email: '', phone: '' });
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (route.view === 'app' && route.tempId) {
      setLoading(true);
      setError('');
      fetch(`${API_BASE}/applications/${route.tempId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Not found');
          }
          return response.json();
        })
        .then((data) => {
          const nextApplication = normalizeResponse(data);
          setApplication(nextApplication);
          setActiveSection(nextApplication.currentSection);
          setContextForm(buildContextForm(nextApplication));
          setIdentityForm(buildIdentityForm(nextApplication));
          setPassportForm(buildPassportForm(nextApplication));
          setContactForm(buildContactForm(nextApplication));
          setEmailOtp('');
          setPhoneOtp('');
        })
        .catch(() => setError('Resume failed. Check the tempId and backend state.'))
        .finally(() => setLoading(false));
      return;
    }

    if (route.view === 'shell') {
      setApplication(EMPTY_APPLICATION);
      setActiveSection('APPLICATION_CONTEXT');
      setContextForm(EMPTY_CONTEXT_FORM);
      setIdentityForm(EMPTY_IDENTITY_FORM);
      setPassportForm(EMPTY_PASSPORT_FORM);
      setContactForm(EMPTY_CONTACT_FORM);
      setEmailOtp('');
      setPhoneOtp('');
      setFieldErrors({
        APPLICATION_CONTEXT: {},
        IDENTITY: {},
        PASSPORT: {},
        CONTACT: {},
      });
      setVerificationResult(null);
      setSimulatedOtps({ email: '', phone: '' });
      setError('');
    }
  }, [route]);

  function canOpenSection(key) {
    return key === application.currentSection || application.completedSections.includes(key);
  }

  function openSection(key) {
    if (canOpenSection(key)) {
      setActiveSection(key);
    }
  }

  async function saveApplicationContext(event) {
    event.preventDefault();
    setError('');
    const errors = validateContextForm(contextForm);
    setFieldErrors((current) => ({ ...current, APPLICATION_CONTEXT: errors }));
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/application-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextForm),
      });
      if (!response.ok) {
        setError('Application Context save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setContextForm(buildContextForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
      if (result.tempId) {
        window.location.hash = `#/app/${result.tempId}`;
      }
    } catch {
      setError('Application Context save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveIdentity(event) {
    event.preventDefault();
    setError('');
    const errors = validateIdentityForm(identityForm);
    setFieldErrors((current) => ({ ...current, IDENTITY: errors }));
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...identityForm,
          residenceHistory: identityForm.residenceHistory
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) {
        setError('Identity save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setIdentityForm(buildIdentityForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Identity save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function savePassport(event) {
    event.preventDefault();
    setError('');
    const errors = validatePassportForm(passportForm);
    setFieldErrors((current) => ({ ...current, PASSPORT: errors }));
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/passport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passportForm),
      });
      if (!response.ok) {
        setError('Passport save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setPassportForm(buildPassportForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Passport save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveContact(event) {
    event.preventDefault();
    setError('');
    const errors = validateContactForm(contactForm);
    setFieldErrors((current) => ({ ...current, CONTACT: errors }));
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        setError('Please check the email fields and phone details.');
        return;
      }

      const saved = await response.json();
      const nextApplication = {
        ...application,
        applicationId: saved.applicationId,
        tempId: saved.tempId || application.tempId,
        applicationStatus: saved.applicationStatus,
        contact: {
          email: saved.email,
          countryCode: saved.countryCode,
          phone: saved.phone,
          emailVerified: false,
          phoneVerified: false,
        },
      };
      setApplication(nextApplication);
      setActiveSection('CONTACT');
      setContactForm({
        applicationId: saved.applicationId,
        email: contactForm.email,
        confirmEmail: contactForm.confirmEmail,
        countryCode: contactForm.countryCode,
        phone: contactForm.phone,
      });

      const [emailOtpResponse, phoneOtpResponse] = await Promise.all([
        fetch(`${API_BASE}/contact/${saved.applicationId}/otp/email`, { method: 'POST' }),
        fetch(`${API_BASE}/contact/${saved.applicationId}/otp/phone`, { method: 'POST' }),
      ]);

      const emailOtpPayload = await emailOtpResponse.json();
      const phoneOtpPayload = await phoneOtpResponse.json();
      setSimulatedOtps({ email: emailOtpPayload.otp, phone: phoneOtpPayload.otp });
    } catch {
      setError('Contact save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function verifyContact(event) {
    event.preventDefault();
    setError('');

    if (!contactForm.applicationId) {
      setError('Save the contact details first.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/contact/${contactForm.applicationId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOtp, phoneOtp }),
      });

      if (!response.ok) {
        setError('OTP verification failed. Please try again.');
        return;
      }

      const result = await response.json();
      setVerificationResult(result);
      const nextApplication = {
        ...application,
        tempId: result.tempId,
        currentSection: result.currentSection,
        completedSections: result.completedSections,
        applicationStatus: 'SUBMITTED',
        contact: {
          ...(application.contact || {}),
          emailVerified: true,
          phoneVerified: true,
        },
      };
      setApplication(nextApplication);
      setActiveSection(result.currentSection);
      if (result.tempId) {
        window.location.hash = `#/app/${result.tempId}`;
      }
    } catch {
      setError('OTP verification failed. Make sure the backend is running on port 8080.');
    }
  }

  async function handleResume(event) {
    event.preventDefault();
    setError('');
    const tempId = event.currentTarget.tempId.value.trim();
    if (!tempId) {
      setError('Enter a tempId to resume.');
      return;
    }
    window.location.hash = `#/app/${encodeURIComponent(tempId)}`;
  }

  const currentStep = SECTION_STEPS.find((step) => step.key === activeSection) || SECTION_STEPS[0];

  return (
    <main className="app-shell">
      <div className="disclaimer-banner">
        Independent hackathon concept prototype — not affiliated with the Government of India. OTP,
        SMS/WhatsApp, and email delivery are simulated for this demo.
      </div>

      {route.view === 'resume' ? (
        <section className="resume-card">
          <h1>Resume application</h1>
          <p className="panel-note">Re-enter your tempId to continue where you left off.</p>
          <form className="form-grid" onSubmit={handleResume}>
            <label>
              tempId
              <input name="tempId" type="text" autoComplete="off" />
            </label>
            <button type="submit">Resume application</button>
          </form>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="button" className="link-button" onClick={() => (window.location.hash = '#')}>
            Back to application
          </button>
        </section>
      ) : (
        <section className="shell-grid">
          <aside className="step-rail">
            <div className="step-rail-header">
              <h1>VisaFlow</h1>
              <button type="button" className="link-button" onClick={() => (window.location.hash = '#/resume')}>
                Resume application
              </button>
            </div>
            <ol className="step-list">
              {SECTION_STEPS.map((step, index) => {
                const completed = application.completedSections.includes(step.key);
                const active = step.key === activeSection;
                const clickable = canOpenSection(step.key);
                return (
                  <li key={step.key}>
                    <button
                      type="button"
                      className={`step-item ${active ? 'is-active' : ''} ${completed ? 'is-complete' : ''}`}
                      onClick={() => openSection(step.key)}
                      disabled={!clickable}
                    >
                      <span className="step-badge">{completed ? '✓' : String(index + 1).padStart(2, '0')}</span>
                      <span>{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="content-panel">
            <div className="panel-note">
              Current section: {currentStep.label}
              {application.tempId ? ` · tempId ${application.tempId}` : ''}
            </div>

            {loading ? <div className="info-box">Loading saved application...</div> : null}
            {error ? <div className="error-box">{error}</div> : null}
            {verificationResult ? (
              <section className="result-box">
                <div>Temp ID: {verificationResult.tempId}</div>
                <div className="result-note">In production, these would be real delivery messages.</div>
                {verificationResult.dispatchLog.map((item) => (
                  <div key={item.channel}>
                    {item.channel}: {item.message}
                  </div>
                ))}
              </section>
            ) : null}

            {activeSection === 'APPLICATION_CONTEXT' ? (
              <section className="section-card">
                <h2>Application Context</h2>
                <form className="form-grid" onSubmit={saveApplicationContext}>
                  <label>
                    Country applying from
                    <input
                      value={contextForm.countryApplyingFrom}
                      onChange={(event) => setContextForm({ ...contextForm, countryApplyingFrom: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.countryApplyingFrom ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.countryApplyingFrom}</span>
                    ) : null}
                  </label>
                  <label>
                    Indian mission
                    <input
                      value={contextForm.indianMission}
                      onChange={(event) => setContextForm({ ...contextForm, indianMission: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.indianMission ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.indianMission}</span>
                    ) : null}
                  </label>
                  <label>
                    Nationality
                    <input
                      value={contextForm.nationality}
                      onChange={(event) => setContextForm({ ...contextForm, nationality: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.nationality ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.nationality}</span>
                    ) : null}
                  </label>
                  <label>
                    Passport type
                    <input
                      value={contextForm.passportType}
                      onChange={(event) => setContextForm({ ...contextForm, passportType: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.passportType ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.passportType}</span>
                    ) : null}
                  </label>
                  <label>
                    Port of arrival
                    <input
                      value={contextForm.portOfArrival}
                      onChange={(event) => setContextForm({ ...contextForm, portOfArrival: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.portOfArrival ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.portOfArrival}</span>
                    ) : null}
                  </label>
                  <label>
                    Expected arrival date
                    <input
                      value={contextForm.expectedArrivalDate}
                      onChange={(event) => setContextForm({ ...contextForm, expectedArrivalDate: event.target.value })}
                      type="text"
                      placeholder="YYYY-MM-DD"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.expectedArrivalDate ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.expectedArrivalDate}</span>
                    ) : null}
                  </label>
                  <label>
                    Date of birth
                    <input
                      value={contextForm.dateOfBirth}
                      onChange={(event) => setContextForm({ ...contextForm, dateOfBirth: event.target.value })}
                      type="text"
                      placeholder="YYYY-MM-DD"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.dateOfBirth ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.dateOfBirth}</span>
                    ) : null}
                  </label>
                  <label>
                    Visa purpose
                    <input
                      value={contextForm.visaPurpose}
                      onChange={(event) => setContextForm({ ...contextForm, visaPurpose: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.visaPurpose ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.visaPurpose}</span>
                    ) : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'IDENTITY' ? (
              <section className="section-card">
                <h2>Identity</h2>
                <form className="form-grid" onSubmit={saveIdentity}>
                  <label>
                    First name
                    <input value={identityForm.firstName} onChange={(event) => setIdentityForm({ ...identityForm, firstName: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.firstName ? <span className="field-error">{fieldErrors.IDENTITY.firstName}</span> : null}
                  </label>
                  <label>
                    Last name
                    <input value={identityForm.lastName} onChange={(event) => setIdentityForm({ ...identityForm, lastName: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.lastName ? <span className="field-error">{fieldErrors.IDENTITY.lastName}</span> : null}
                  </label>
                  <label>
                    Previous name
                    <input value={identityForm.previousName} onChange={(event) => setIdentityForm({ ...identityForm, previousName: event.target.value })} type="text" />
                  </label>
                  <label>
                    Gender
                    <input value={identityForm.gender} onChange={(event) => setIdentityForm({ ...identityForm, gender: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.gender ? <span className="field-error">{fieldErrors.IDENTITY.gender}</span> : null}
                  </label>
                  <label>
                    Date of birth
                    <input value={identityForm.dob} onChange={(event) => setIdentityForm({ ...identityForm, dob: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.IDENTITY.dob ? <span className="field-error">{fieldErrors.IDENTITY.dob}</span> : null}
                  </label>
                  <label>
                    City of birth
                    <input value={identityForm.cityOfBirth} onChange={(event) => setIdentityForm({ ...identityForm, cityOfBirth: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.cityOfBirth ? <span className="field-error">{fieldErrors.IDENTITY.cityOfBirth}</span> : null}
                  </label>
                  <label>
                    Country of birth
                    <input value={identityForm.countryOfBirth} onChange={(event) => setIdentityForm({ ...identityForm, countryOfBirth: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.countryOfBirth ? <span className="field-error">{fieldErrors.IDENTITY.countryOfBirth}</span> : null}
                  </label>
                  <label>
                    Citizenship ID
                    <input value={identityForm.citizenshipId} onChange={(event) => setIdentityForm({ ...identityForm, citizenshipId: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.citizenshipId ? <span className="field-error">{fieldErrors.IDENTITY.citizenshipId}</span> : null}
                  </label>
                  <label>
                    Religion
                    <input value={identityForm.religion} onChange={(event) => setIdentityForm({ ...identityForm, religion: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.religion ? <span className="field-error">{fieldErrors.IDENTITY.religion}</span> : null}
                  </label>
                  <label>
                    Identification mark
                    <input value={identityForm.identificationMark} onChange={(event) => setIdentityForm({ ...identityForm, identificationMark: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.identificationMark ? <span className="field-error">{fieldErrors.IDENTITY.identificationMark}</span> : null}
                  </label>
                  <label>
                    Education
                    <input value={identityForm.education} onChange={(event) => setIdentityForm({ ...identityForm, education: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.education ? <span className="field-error">{fieldErrors.IDENTITY.education}</span> : null}
                  </label>
                  <label>
                    Nationality
                    <input value={identityForm.nationality} onChange={(event) => setIdentityForm({ ...identityForm, nationality: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.nationality ? <span className="field-error">{fieldErrors.IDENTITY.nationality}</span> : null}
                  </label>
                  <label>
                    Nationality acquired by
                    <input value={identityForm.nationalityAcquiredBy} onChange={(event) => setIdentityForm({ ...identityForm, nationalityAcquiredBy: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.nationalityAcquiredBy ? <span className="field-error">{fieldErrors.IDENTITY.nationalityAcquiredBy}</span> : null}
                  </label>
                  <label>
                    Residence history
                    <input value={identityForm.residenceHistory} onChange={(event) => setIdentityForm({ ...identityForm, residenceHistory: event.target.value })} type="text" placeholder="Comma-separated entries" />
                    {fieldErrors.IDENTITY.residenceHistory ? <span className="field-error">{fieldErrors.IDENTITY.residenceHistory}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'PASSPORT' ? (
              <section className="section-card">
                <h2>Passport</h2>
                <form className="form-grid" onSubmit={savePassport}>
                  <label>
                    Passport number
                    <input value={passportForm.number} onChange={(event) => setPassportForm({ ...passportForm, number: event.target.value.toUpperCase() })} type="text" placeholder="VF-XXXXXX" />
                    {fieldErrors.PASSPORT.number ? <span className="field-error">{fieldErrors.PASSPORT.number}</span> : null}
                  </label>
                  <label>
                    Place of issue
                    <input value={passportForm.placeOfIssue} onChange={(event) => setPassportForm({ ...passportForm, placeOfIssue: event.target.value })} type="text" />
                    {fieldErrors.PASSPORT.placeOfIssue ? <span className="field-error">{fieldErrors.PASSPORT.placeOfIssue}</span> : null}
                  </label>
                  <label>
                    Date of issue
                    <input value={passportForm.dateOfIssue} onChange={(event) => setPassportForm({ ...passportForm, dateOfIssue: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.PASSPORT.dateOfIssue ? <span className="field-error">{fieldErrors.PASSPORT.dateOfIssue}</span> : null}
                  </label>
                  <label>
                    Date of expiry
                    <input value={passportForm.dateOfExpiry} onChange={(event) => setPassportForm({ ...passportForm, dateOfExpiry: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.PASSPORT.dateOfExpiry ? <span className="field-error">{fieldErrors.PASSPORT.dateOfExpiry}</span> : null}
                  </label>
                  <label>
                    Additional passport
                    <input checked={passportForm.hasAdditionalPassport} onChange={(event) => setPassportForm({ ...passportForm, hasAdditionalPassport: event.target.checked })} type="checkbox" />
                  </label>
                  <label>
                    Additional passport details
                    <input value={passportForm.additionalPassportDetails} onChange={(event) => setPassportForm({ ...passportForm, additionalPassportDetails: event.target.value })} type="text" />
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'CONTACT' ? (
              <section className="section-card">
                <h2>Contact</h2>
                <form className="form-grid" onSubmit={saveContact}>
                  <label>
                    Email
                    <input
                      value={contactForm.email}
                      onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                      type="email"
                      autoComplete="email"
                    />
                    {fieldErrors.CONTACT.email ? <span className="field-error">{fieldErrors.CONTACT.email}</span> : null}
                  </label>
                  <label>
                    Confirm email
                    <input
                      value={contactForm.confirmEmail}
                      onChange={(event) => setContactForm({ ...contactForm, confirmEmail: event.target.value })}
                      type="email"
                      autoComplete="email"
                    />
                    {fieldErrors.CONTACT.confirmEmail ? <span className="field-error">{fieldErrors.CONTACT.confirmEmail}</span> : null}
                  </label>
                  <label>
                    Country code
                    <input
                      value={contactForm.countryCode}
                      onChange={(event) => setContactForm({ ...contactForm, countryCode: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.CONTACT.countryCode ? <span className="field-error">{fieldErrors.CONTACT.countryCode}</span> : null}
                  </label>
                  <label>
                    Phone
                    <input
                      value={contactForm.phone}
                      onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                      type="tel"
                      autoComplete="tel"
                    />
                    {fieldErrors.CONTACT.phone ? <span className="field-error">{fieldErrors.CONTACT.phone}</span> : null}
                  </label>
                  <button type="submit">Save contact details</button>
                </form>

                {contactForm.applicationId ? (
                  <form className="form-grid otp-grid" onSubmit={verifyContact}>
                    <div className="dev-box">
                      <strong>DEV MODE — Simulated SMS/Email</strong>
                      <div>Email OTP: {simulatedOtps.email || 'Pending'}</div>
                      <div>Phone OTP: {simulatedOtps.phone || 'Pending'}</div>
                    </div>

                    <label>
                      Email OTP
                      <input value={emailOtp} onChange={(event) => setEmailOtp(event.target.value)} inputMode="numeric" />
                    </label>
                    <label>
                      Phone OTP
                      <input value={phoneOtp} onChange={(event) => setPhoneOtp(event.target.value)} inputMode="numeric" />
                    </label>
                    <button type="submit">Verify OTPs</button>
                  </form>
                ) : null}
              </section>
            ) : (
              <section className="section-card placeholder-card">
                <h2>{sectionLabel(activeSection)}</h2>
                <p>This section is not built yet.</p>
              </section>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
