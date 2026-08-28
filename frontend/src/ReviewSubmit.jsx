import { useEffect, useState } from 'react';

export default function ReviewSubmit({ tempId, onSubmitted }) {
  const [sections, setSections] = useState({});
  const [applicationData, setApplicationData] = useState({});
  const [declared, setDeclared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!tempId) {
      setLoading(false);
      return;
    }
    fetch(`http://localhost:3000/api/applications/${tempId}`)
      .then((res) => res.json())
      .then((data) => {
        setSections(data.sections || {});
        setApplicationData(data.application || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tempId]);

  const contextData = sections['application-context'] || {};
  const identityData = sections['identity'] || {};
  const passportData = sections['passport'] || {};
  const contactData = sections['contact'] || {};
  const addressData = sections['address'] || {};
  const familyData = sections['family'] || {};
  const occupationData = sections['occupation'] || {};
  const visaTripData = sections['visa-trip'] || {};
  const prevIndiaData = sections['previous-india-travel'] || {};
  const travelHistData = sections['travel-history'] || {};
  const referencesData = sections['references'] || {};
  const bgData = sections['background-answers'] || {};

  // Client-side cross-field consistency validation
  const consistencyErrors = [];
  if (contextData.dateOfBirth && identityData.dob && contextData.dateOfBirth !== identityData.dob) {
    consistencyErrors.push(
      `Date of Birth mismatch: Application Context states "${contextData.dateOfBirth}" but Identity section states "${identityData.dob}".`
    );
  }

  if (
    contextData.portOfArrival &&
    visaTripData.portOfArrival &&
    contextData.portOfArrival.trim().toLowerCase() !== visaTripData.portOfArrival.trim().toLowerCase()
  ) {
    consistencyErrors.push(
      `Port of Arrival mismatch: Application Context states "${contextData.portOfArrival}" but Visa Trip section states "${visaTripData.portOfArrival}".`
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!declared || consistencyErrors.length > 0 || !tempId) return;

    setSubmitting(true);
    setSubmitErrors([]);

    try {
      const res = await fetch(`http://localhost:3000/api/applications/${tempId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitErrors(data.errors || [data.error || 'Submission failed. Please resolve errors.']);
      } else {
        setConfirmation(data);
        if (onSubmitted) onSubmitted(data);
      }
    } catch (err) {
      setSubmitErrors(['Network error during submission. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="info-box">Loading application summary...</div>;
  }

  if (confirmation) {
    return (
      <section className="section-card confirmation-card" style={{ background: '#e6fffa', borderColor: '#38b2ac', padding: '24px', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '48px' }}>🎉</span>
          <h2 style={{ color: '#234e52', marginTop: '10px' }}>Application Submitted Successfully!</h2>
          <p style={{ color: '#2c7a7b' }}>Your Indian Visa Application has been officially received and logged.</p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #b2f5ea', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#4a5568' }}>Final Reference Number</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', letterSpacing: '1px', margin: '4px 0' }}>
            {confirmation.finalReferenceNumber}
          </div>
          <div style={{ fontSize: '12px', color: '#718096' }}>Temporary Session ID: {confirmation.tempId}</div>
          <div style={{ fontSize: '12px', color: '#718096' }}>Status: <strong>{confirmation.applicationStatus}</strong></div>
        </div>

        <p style={{ fontSize: '14px', color: '#2d3748' }}>
          Please keep this <strong>Final Reference Number ({confirmation.finalReferenceNumber})</strong> for tracking your visa processing status.
        </p>
      </section>
    );
  }

  return (
    <section className="section-card">
      <h2>Section 15: Review & Final Submission</h2>
      <p>Please carefully review the summary of all entered application details before final submission.</p>

      {/* Consistency Mismatch Alert */}
      {consistencyErrors.length > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: '#9b2c2c' }}>
          <h4>⚠️ Cross-Field Consistency Conflicts Found</h4>
          <p style={{ fontSize: '14px' }}>The following details must match across sections before submission is allowed:</p>
          <ul>
            {consistencyErrors.map((err, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Backend Submission Errors */}
      {submitErrors.length > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: '#9b2c2c' }}>
          <h4>⚠️ Submission Error</h4>
          <ul>
            {submitErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Read-Only Summary Cards */}
      <div className="summary-grid" style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        
        {/* Application Context */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>1. Application Context</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Country Applying From:</strong> {contextData.countryApplyingFrom || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Indian Mission:</strong> {contextData.indianMission || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Passport Type:</strong> {contextData.passportType || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Port of Arrival:</strong> {contextData.portOfArrival || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Expected Arrival Date:</strong> {contextData.expectedArrivalDate || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Date of Birth:</strong> {contextData.dateOfBirth || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Visa Purpose:</strong> {contextData.visaPurpose || 'N/A'}</p>
        </div>

        {/* Identity */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>2. Identity</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Name:</strong> {identityData.firstName || ''} {identityData.lastName || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Gender:</strong> {identityData.gender || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Date of Birth:</strong> {identityData.dob || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Place of Birth:</strong> {identityData.cityOfBirth || ''}, {identityData.countryOfBirth || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Citizenship / National ID:</strong> {identityData.citizenshipId || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Religion:</strong> {identityData.religion || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Education:</strong> {identityData.education || 'N/A'}</p>
        </div>

        {/* Passport */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>3. Passport Details</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Passport Number:</strong> {passportData.number || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Place of Issue:</strong> {passportData.placeOfIssue || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Date of Issue / Expiry:</strong> {passportData.dateOfIssue || 'N/A'} to {passportData.dateOfExpiry || 'N/A'}</p>
        </div>

        {/* Contact */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>4. Contact Details</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Email:</strong> {contactData.email || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Phone:</strong> {contactData.countryCode || ''} {contactData.phone || 'N/A'}</p>
        </div>

        {/* Address */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>5. Address</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Present Address:</strong> {addressData.presentLine1 || ''}, {addressData.presentCity || ''}, {addressData.presentState || ''}, {addressData.presentCountry || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Postal Code:</strong> {addressData.postalCode || 'N/A'}</p>
        </div>

        {/* Family */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>6. Family</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Father's Name:</strong> {familyData.fatherName || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Mother's Name:</strong> {familyData.motherName || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Marital Status:</strong> {familyData.maritalStatus || 'N/A'}</p>
        </div>

        {/* Occupation */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>7. Occupation</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Current Occupation:</strong> {occupationData.current || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Employer:</strong> {occupationData.employer || 'N/A'}</p>
        </div>

        {/* Visa Trip */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>8. Visa & Trip Details</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Visa Type:</strong> {visaTripData.visaType || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Port of Arrival:</strong> {visaTripData.portOfArrival || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Arrival Date:</strong> {visaTripData.arrivalDate || 'N/A'}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Port of Exit:</strong> {visaTripData.portOfExit || 'N/A'}</p>
        </div>

        {/* References */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>11. References</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>India Ref:</strong> {referencesData.indiaRefName || 'N/A'} ({referencesData.indiaRefPhone || 'N/A'})</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Home Country Ref:</strong> {referencesData.homeCountryRefName || 'N/A'} ({referencesData.homeCountryRefPhone || 'N/A'})</p>
        </div>
      </div>

      {/* Declaration Checkbox */}
      <div style={{ background: '#edf2f7', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px' }}>
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <span>I hereby declare that all information provided in this visa application is accurate, complete, and true.</span>
        </label>
      </div>

      {/* Submit Button */}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={!declared || consistencyErrors.length > 0 || submitting || !tempId}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: declared && consistencyErrors.length === 0 ? '#2b6cb0' : '#cbd5e0',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: declared && consistencyErrors.length === 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Submitting Application...' : 'Submit Visa Application'}
        </button>
      </form>
    </section>
  );
}
