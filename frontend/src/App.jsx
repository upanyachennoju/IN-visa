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

const EMPTY_APPLICATION = {
  tempId: '',
  currentSection: 'CONTACT',
  completedSections: [],
  applicationStatus: 'DRAFT',
  contact: {
    email: '',
    countryCode: '+91',
    phone: '',
    emailVerified: false,
    phoneVerified: false,
  },
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

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [application, setApplication] = useState(EMPTY_APPLICATION);
  const [activeSection, setActiveSection] = useState('CONTACT');
  const [draftId, setDraftId] = useState(null);
  const [contactForm, setContactForm] = useState({
    email: '',
    confirmEmail: '',
    countryCode: '+91',
    phone: '',
  });
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
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
          const nextApplication = {
            ...EMPTY_APPLICATION,
            ...data,
            contact: {
              ...EMPTY_APPLICATION.contact,
              ...(data.contact || {}),
            },
          };
          setApplication(nextApplication);
          setActiveSection(data.currentSection || 'CONTACT');
          setContactForm({
            email: nextApplication.contact.email || '',
            confirmEmail: nextApplication.contact.email || '',
            countryCode: nextApplication.contact.countryCode || '+91',
            phone: nextApplication.contact.phone || '',
          });
        })
        .catch(() => setError('Resume failed. Check the tempId and backend state.'))
        .finally(() => setLoading(false));
      return;
    }

    if (route.view === 'shell') {
      setApplication(EMPTY_APPLICATION);
      setActiveSection('CONTACT');
      setVerificationResult(null);
      setDraftId(null);
      setEmailOtp('');
      setPhoneOtp('');
      setSimulatedOtps({ email: '', phone: '' });
      setContactForm({
        email: '',
        confirmEmail: '',
        countryCode: '+91',
        phone: '',
      });
      setError('');
    }
  }, [route]);

  async function handleSave(event) {
    event.preventDefault();
    setError('');
    setVerificationResult(null);
    setEmailOtp('');
    setPhoneOtp('');
    setSimulatedOtps({ email: '', phone: '' });

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
      setDraftId(saved.applicationId);
      setApplication((current) => ({
        ...current,
        applicationStatus: saved.applicationStatus,
        contact: {
          ...current.contact,
          email: saved.email,
          countryCode: saved.countryCode,
          phone: saved.phone,
        },
        currentSection: 'CONTACT',
        completedSections: [],
      }));
      setActiveSection('CONTACT');

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

  async function handleVerify(event) {
    event.preventDefault();
    setError('');

    if (!draftId) {
      setError('Save the contact details first.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/contact/${draftId}/verify`, {
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
      setApplication((current) => ({
        ...current,
        tempId: result.tempId,
        currentSection: result.currentSection,
        completedSections: result.completedSections,
        applicationStatus: 'SUBMITTED',
        contact: {
          ...current.contact,
          emailVerified: true,
          phoneVerified: true,
        },
      }));
      setActiveSection(result.currentSection);
      window.location.hash = `#/app/${result.tempId}`;
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

  function canOpenSection(key) {
    return key === application.currentSection || application.completedSections.includes(key);
  }

  function openSection(key) {
    if (canOpenSection(key)) {
      setActiveSection(key);
    }
  }

  const currentStep = SECTION_STEPS.find((step) => step.key === activeSection) || SECTION_STEPS[3];

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
              {SECTION_STEPS.map((step) => {
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
                      <span className="step-badge">{completed ? '✓' : String(SECTION_STEPS.indexOf(step) + 1).padStart(2, '0')}</span>
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

            {activeSection === 'CONTACT' ? (
              <section className="section-card">
                <h2>Contact</h2>
                <form className="form-grid" onSubmit={handleSave}>
                  <label>
                    Email
                    <input
                      value={contactForm.email}
                      onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                      type="email"
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Confirm email
                    <input
                      value={contactForm.confirmEmail}
                      onChange={(event) => setContactForm({ ...contactForm, confirmEmail: event.target.value })}
                      type="email"
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Country code
                    <input
                      value={contactForm.countryCode}
                      onChange={(event) => setContactForm({ ...contactForm, countryCode: event.target.value })}
                      type="text"
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={contactForm.phone}
                      onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                      type="tel"
                      autoComplete="tel"
                    />
                  </label>
                  <button type="submit">Save contact details</button>
                </form>

                {draftId ? (
                  <form className="form-grid otp-grid" onSubmit={handleVerify}>
                    <div className="dev-box">
                      <strong>DEV MODE — Simulated SMS/Email</strong>
                      <div>Email OTP: {simulatedOtps.email || 'Pending'}</div>
                      <div>Phone OTP: {simulatedOtps.phone || 'Pending'}</div>
                    </div>

                    <label>
                      Email OTP
                      <input
                        value={emailOtp}
                        onChange={(event) => setEmailOtp(event.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                    <label>
                      Phone OTP
                      <input
                        value={phoneOtp}
                        onChange={(event) => setPhoneOtp(event.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                    <button type="submit">Verify OTPs</button>
                  </form>
                ) : null}

              </section>
            ) : (
              <section className="section-card placeholder-card">
                <h2>{currentStep.label}</h2>
                <p>This section is not built yet.</p>
              </section>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
