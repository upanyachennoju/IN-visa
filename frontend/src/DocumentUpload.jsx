import { useState } from 'react';

function SingleDocCheck({ label, tempId }) {
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!file) return;
    if (!tempId) {
      setError('Missing tempId. Please ensure application session is active.');
      return;
    }
    setChecking(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('tempId', tempId);

    try {
      const res = await fetch('http://localhost:3000/api/documents/photo-check', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        faceVisible: false,
        faceCentered: false,
        backgroundPlain: false,
        resolutionAdequate: false,
        hasBlurOrGlare: false,
        overallPass: false,
        fixInstruction: "We couldn't check your photo automatically — please make sure your face is clearly visible against a plain background."
      });
    } finally {
      setChecking(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="doc-check-box" style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>{label}</h3>
      {!result ? (
        <form onSubmit={handleCheck}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={!file || checking}>
            {checking ? 'Checking quality...' : `Upload and Check ${label}`}
          </button>
        </form>
      ) : (
        <div>
          <h4>Quality Analysis Result</h4>
          <div style={{ margin: '12px 0' }}>
            <p>Overall Status: <strong>{result.overallPass ? '✅ PASSED' : '❌ NEEDS ATTENTION'}</strong></p>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              <li>{result.faceVisible ? '✅' : '❌'} Face Visible</li>
              <li>{result.faceCentered ? '✅' : '❌'} Face Centered</li>
              <li>{result.backgroundPlain ? '✅' : '❌'} Plain Background</li>
              <li>{result.resolutionAdequate ? '✅' : '❌'} Resolution Adequate</li>
              <li>{!result.hasBlurOrGlare ? '✅' : '❌'} No Blur or Glare</li>
            </ul>
            {result.fixInstruction && (
              <p style={{ background: '#f8d7da', color: '#721c24', padding: '8px', borderRadius: '4px' }}>
                💡 <strong>Instruction:</strong> {result.fixInstruction}
              </p>
            )}
          </div>
          <button onClick={handleReset}>Re-upload / Try Another Photo</button>
        </div>
      )}
    </div>
  );
}

export default function DocumentUpload({ tempId }) {
  return (
    <section className="section-card">
      <h2>Section 13: Documents & Quality Verification</h2>
      <p>Upload applicant photo and passport scan for automated quality validation.</p>
      <SingleDocCheck label="Applicant Photo" tempId={tempId} />
      <SingleDocCheck label="Passport Document Scan" tempId={tempId} />
    </section>
  );
}
