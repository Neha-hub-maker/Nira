import { useEffect, useRef, useState } from 'react';
import { AppShell } from './AppShell.jsx';
import { Icon } from './Icon.jsx';
import { CareJourneys, LatestReadings, RecentRecords } from './DashboardPanels.jsx';
import { demoPatient, demoRecords, demoJourneys, demoReadings } from './demoData.js';
import { formatDate } from './formatDate.js';

const dependencies = {
  upload: { title: 'Upload a record', description: 'Record upload is not connected in this design preview. It needs the patient application’s authenticated, permission-checked vault upload flow. No files can be selected or uploaded here.' },
  share: { title: 'Share with a doctor', description: 'Secure sharing is not connected in this design preview. It needs the patient application’s access-grant flow and existing permission checks. No records, links or access tokens are shared here.' },
  profile: { title: 'Profile & plan', description: 'Account and plan management are not connected in this design preview. This destination needs the patient application’s authenticated profile and billing routes.' },
  vault: { title: 'Vault connection required', description: 'Unlocking is not connected in this design preview. It requires the patient application’s existing vault unlock flow and permission checks. This preview cannot unlock or retrieve patient information.' },
};

function PreviewDialog({ content, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { if (content) dialog.current?.showModal(); }, [content]);
  return <dialog ref={dialog} className="pt-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
    {content && <div className="pt-dialog__content"><div className="pt-dialog__top"><span className="pt-overline">FICTIONAL DESIGN PREVIEW</span><button className="pt-close" aria-label="Close dialog" onClick={() => dialog.current.close()}><Icon name="close" /></button></div><h2 id="dialog-title">{content.title}</h2><p id="dialog-description">{content.description}</p>{content.record && <dl className="pt-dialog__details"><div><dt>Category</dt><dd>{content.record.category}</dd></div><div><dt>Clinical record date</dt><dd>{content.record.date ? formatDate(content.record.date) : 'Not provided'}</dd></div><div><dt>Uploaded</dt><dd>{formatDate(content.record.uploaded)}</dd></div></dl>}{content.record && <p className="pt-dialog__note">Fictional metadata only. No original document or patient file is available.</p>}{content.share && <a className="pt-text-button" href="./consultation.html#sharing-preview">Explore the fictional sharing demo<Icon name="arrow" size={17} /></a>}<button className="pt-button pt-button--primary pt-dialog__done" onClick={() => dialog.current.close()}>Got it</button></div>}
  </dialog>;
}

export function Dashboard() {
  const [previewState, setPreviewState] = useState('populated');
  const [dialogContent, setDialogContent] = useState(null);
  const unavailable = (kind) => setDialogContent({ ...dependencies[kind], share: kind === 'share' });
  // No data requests: this entry point only consumes isolated, fictional fixtures.
  const populated = previewState === 'populated';
  return <AppShell patient={demoPatient} onUnavailable={unavailable}>
    <main className="pt-main" id="overview" tabIndex={-1}>
      <div className="pt-page-heading"><div><p className="pt-greeting">Hello, {demoPatient.firstName}.</p><h1>Your health, <em>at a glance.</em></h1><p className="pt-page-description">Your records and ongoing care, thoughtfully connected.</p></div><div className="pt-header-actions"><button className="pt-button pt-button--secondary" onClick={() => unavailable('share')}><Icon name="share" size={17} />Share with a doctor</button><button className="pt-button pt-button--primary" onClick={() => unavailable('upload')}><Icon name="upload" size={17} />Upload a record</button></div></div>
      <div className="pt-demo-notice"><div><Icon name="info" size={18} /><p><strong>Fictional demo</strong><span>No live patient data. Nothing is uploaded or shared.</span></p></div><label className="pt-state-control">Preview state<select value={previewState} onChange={(event) => setPreviewState(event.target.value)}><option value="populated">Sample data</option><option value="empty">Empty</option><option value="loading">Loading</option><option value="locked">Locked vault</option></select></label></div>
      <div className="pt-overview-label"><span className="pt-overline">YOUR OVERVIEW</span><span>Patient dashboard preview</span></div>
      {previewState === 'locked' && <div className="pt-vault-notice"><Icon name="lock" size={18} /><p><strong>Locked vault preview.</strong> All health details are hidden.</p><button className="pt-text-button" onClick={() => unavailable('vault')}>About unlocking<Icon name="arrow" size={16} /></button></div>}
      <div className="pt-dashboard-grid" aria-busy={previewState === 'loading' ? true : undefined}>
        <div className="pt-main-column">
          <RecentRecords records={populated ? demoRecords : []} state={previewState} onUpload={() => unavailable('upload')} onRecord={(record) => setDialogContent({ title: record.title, description: record.description, record })} />
          <CareJourneys journeys={populated ? demoJourneys : []} state={previewState} />
        </div>
        <div className="pt-side-column">
          <LatestReadings readings={populated ? demoReadings : []} state={previewState} />
          <section className="pt-shortcuts" aria-labelledby="shortcuts-title"><p className="pt-overline">A LITTLE PREPARATION</p><h2 id="shortcuts-title">Make room for<br />your next question.</h2><p>Keep the details you want to discuss close at hand.</p><a href="./consultation.html">Prepare for a consultation<Icon name="arrow" size={18} /></a></section>
        </div>
      </div>
      <footer className="pt-footer"><span>HealthTrac<span aria-hidden="true"> · </span>A little clarity for what comes next.</span><a href="./">Back to the public site<Icon name="arrow" size={15} /></a></footer>
    </main>
    <PreviewDialog content={dialogContent} onClose={() => setDialogContent(null)} />
  </AppShell>;
}
