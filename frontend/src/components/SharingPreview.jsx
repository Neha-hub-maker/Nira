import { useRef, useState } from 'react';

const scopes = [
  { value: 'full_history', label: 'Full history', description: 'All four fictional records in this preview.', records: ['checkup', 'emergency', 'medication', 'pregnancy'] },
  { value: 'emergency_summary', label: 'Emergency summary', description: 'An example overview of important care information.', records: ['emergency'] },
  { value: 'medication_history', label: 'Medication history', description: 'An example medication list.', records: ['medication'] },
  { value: 'pregnancy_history', label: 'Pregnancy history', description: 'Example prenatal visit and scan notes.', records: ['pregnancy'] },
];
const durations = [
  { value: '15m', label: '15 minutes' }, { value: '1h', label: '1 hour' }, { value: '24h', label: '24 hours' },
];
const records = {
  checkup: { title: 'Annual checkup', date: '12 Jun 2026', type: 'Visit notes' },
  emergency: { title: 'Emergency overview', date: '12 Jun 2026', type: 'Care summary' },
  medication: { title: 'Medication list', date: '02 Jun 2026', type: 'Medication record' },
  pregnancy: { title: 'Prenatal visit notes', date: '20 May 2026', type: 'Pregnancy record' },
};

export function SharingPreview() {
  const [scope, setScope] = useState('emergency_summary');
  const [duration, setDuration] = useState('1h');
  const [preview, setPreview] = useState(null);
  const [revoked, setRevoked] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const submitRef = useRef(null);
  const selectedScope = scopes.find((option) => option.value === scope);
  const selectedDuration = durations.find((option) => option.value === duration);
  const dirty = preview && (preview.scope.value !== scope || preview.duration.value !== duration);

  function showPreview(event) {
    event.preventDefault();
    setPreview({ scope: selectedScope, duration: selectedDuration });
    setRevoked(false);
    setAnnouncement(`Demo preview: ${selectedScope.label} for ${selectedDuration.label}. No records are shared.`);
  }

  function revoke() {
    setPreview(null); setRevoked(true);
    setAnnouncement('Simulated access revoked. No records were shared.');
    submitRef.current.focus();
  }

  return (
    <section className="ct-sharing" id="sharing-preview" tabIndex={-1} aria-labelledby="sharing-title">
      <div className="ct-sharing__intro">
        <p className="ct-eyebrow">A SHARING PREVIEW</p>
        <h2 id="sharing-title">Choose the context.<br />Keep the <em>control.</em></h2>
        <p>Explore what a time-limited selection could look like before sharing anything.</p>
      </div>
      <p className="ct-demo-notice" id="sharing-demo-note">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        Demo—no records are shared
      </p>
      <div className="ct-demo">
        <form className="ct-demo__form" onSubmit={showPreview} aria-label="Sharing selection" aria-describedby="sharing-demo-note">
          <fieldset>
            <legend>What would you like to include?</legend>
            <div className="ct-scope-options">
              {scopes.map((option) => (
                <label key={option.value} className={`ct-scope${scope === option.value ? ' is-selected' : ''}`}>
                  <input type="radio" name="scope" value={option.value} checked={scope === option.value}
                    onChange={() => setScope(option.value)} />
                  <span><strong>{option.label}</strong><span>{option.description}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="ct-duration">
            <legend>For how long?</legend>
            <div className="ct-duration__options">
              {durations.map((option) => (
                <label className={duration === option.value ? 'is-selected' : ''} key={option.value}>
                  <input type="radio" name="duration" value={option.value} checked={duration === option.value}
                    onChange={() => setDuration(option.value)} />{option.label}
                </label>
              ))}
            </div>
          </fieldset>
          {dirty && <p className="ct-draft-note">Selection changed. Preview again to update the simulated access.</p>}
          <button type="submit" className="ct-button" ref={submitRef}>{preview ? 'Update preview' : 'Preview selection'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
          </button>
        </form>

        <div className="ct-demo__preview" aria-labelledby="doctor-preview-title">
          <p className="ct-eyebrow">DOCTOR’S VIEW, ILLUSTRATED</p>
          <h3 id="doctor-preview-title">{preview ? preview.scope.label : revoked ? 'Simulated access revoked' : 'A preview, on your terms.'}</h3>
          {preview ? (
            <>
              <div className="ct-preview__status">Simulated access · Active</div>
              <dl className="ct-preview__details">
                <div><dt>Fictional record owner</dt><dd>Avery Morgan</dd></div>
                <div><dt>Illustrative duration</dt><dd>{preview.duration.label}</dd></div>
              </dl>
              <p className="ct-preview__count">{preview.scope.records.length} fictional {preview.scope.records.length === 1 ? 'record' : 'records'} included</p>
              <ul className="ct-preview__records" aria-label="Fictional records in the preview">
                {preview.scope.records.map((id) => (
                  <li key={id}>
                    <span className="ct-preview__document" aria-hidden="true">
                      <svg width="20" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M5 2h10l5 5v17H5V2Zm10 0v6h5M9 13h7m-7 4h7" /></svg>
                    </span>
                    <span><strong>{records[id].title}</strong><span>{records[id].type} · {records[id].date}</span></span>
                  </li>
                ))}
              </ul>
              <button type="button" className="ct-revoke" onClick={revoke}>Revoke simulated access</button>
              <p className="ct-preview__fineprint">All records are fictional. Duration is illustrative; no access is granted.</p>
            </>
          ) : (
            <div className="ct-preview__empty">
              <span className="ct-preview__empty-mark" aria-hidden="true">↗</span>
              <p>{revoked ? 'This simulated access is no longer active. Choose a selection to explore another preview.' : 'Choose a scope and duration, then preview the fictional records that would be included.'}</p>
            </div>
          )}
          <p className="ct-preview__doctor-note" id="doctor-sign-in-note"><strong>Doctor access requires doctor sign-in.</strong> This demo does not sign anyone in or share records.</p>
        </div>
      </div>
      <span className="ct-sr-only" role="status" aria-live="polite">{announcement}</span>
    </section>
  );
}
