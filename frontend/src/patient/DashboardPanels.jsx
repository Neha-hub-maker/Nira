import { Icon } from './Icon.jsx';
import { formatDate } from './formatDate.js';

export function Panel({ id, title, description, children, aside, className = '' }) {
  return <section id={id} tabIndex={-1} aria-labelledby={`${id}-title`} className={`pt-panel ${className}`}><header className="pt-panel__header"><div><h2 id={`${id}-title`}>{title}</h2><p>{description}</p></div>{aside}</header>{children}</section>;
}

function SectionState({ state, kind, onUpload }) {
  if (state === 'locked') return <div className="pt-empty"><span className="pt-icon-tile"><Icon name="lock" size={24} /></span><h3>Details are locked.</h3><p>This preview hides all health details. The existing patient vault flow is required to unlock them.</p></div>;
  if (state === 'loading') return <div className="pt-loading" role="status"><span>Loading {kind}…</span><div aria-hidden="true" className="pt-skeleton" /><div aria-hidden="true" className="pt-skeleton pt-skeleton--short" /><div aria-hidden="true" className="pt-skeleton" /></div>;
  const messages = {
    records: ['Your records can start here.', 'Add a lab report, prescription or visit note to keep the details together.'],
    journeys: ['No ongoing care journeys.', 'Active care episodes will appear here when they are available from your care history.'],
    readings: ['No readings to show yet.', 'Available biomarker readings and supplied reference ranges will appear here.'],
  };
  const [title, description] = messages[kind];
  return <div className="pt-empty"><span className="pt-icon-tile"><Icon name={kind === 'records' ? 'record' : kind === 'journeys' ? 'care' : 'readings'} size={24} /></span><h3>{title}</h3><p>{description}</p>{kind === 'records' && <button className="pt-text-button" onClick={onUpload}>Upload a record<Icon name="arrow" size={17} /></button>}</div>;
}

export function RecentRecords({ records, state, onRecord, onUpload }) {
  return <Panel id="recent-records" title="Recent records" description="The details you may want to revisit." aside={<Icon name="record" />}>
    {state !== 'populated' ? <SectionState state={state} kind="records" onUpload={onUpload} /> : <ul className="pt-records">{records.map((record) => <li key={record.id}><span className="pt-icon-tile"><Icon name="record" size={23} /></span><div className="pt-records__content"><div className="pt-records__title"><h3>{record.title}</h3><span className="pt-category">{record.category}</span></div><p>{record.date ? <>Record date · <time dateTime={record.date}>{formatDate(record.date)}</time></> : 'Clinical date not provided'}<span className="pt-upload-date">Uploaded {formatDate(record.uploaded)}</span></p></div><button className="pt-record-action" onClick={() => onRecord(record)} aria-label={`View example: ${record.title}`}><span>View example</span><Icon name="chevron" size={18} /></button></li>)}</ul>}
    {state === 'populated' && <div className="pt-panel__footnote">Example documents · Original files are not included</div>}
  </Panel>;
}

export function CareJourneys({ journeys, state }) {
  return <Panel id="care-journeys" title="Ongoing care journeys" description="A little continuity for the care in progress." aside={<Icon name="care" />}>
    {state !== 'populated' ? <SectionState state={state} kind="journeys" /> : <ul className="pt-journeys">{journeys.map((journey) => <li key={journey.id}><div className="pt-journey__top"><span className="pt-category">{journey.type}</span><span className="pt-active"><span aria-hidden="true" />Active</span></div><h3>{journey.title}</h3><p>{journey.description}</p><span className="pt-journey-date">Started <time dateTime={journey.start}>{formatDate(journey.start)}</time></span></li>)}</ul>}
  </Panel>;
}

export function LatestReadings({ readings, state }) {
  return <Panel id="latest-readings" title="Latest readings" description="Small details. A clearer picture." aside={<Icon name="readings" />}>
    {state !== 'populated' ? <SectionState state={state} kind="readings" /> : <><ul className="pt-readings">{readings.map((reading) => <li key={reading.id}><div className="pt-reading__heading"><h3>{reading.name}</h3><time dateTime={reading.date}>{formatDate(reading.date)}</time></div><p className="pt-reading__value">{reading.value}<span>{reading.unit}</span></p><p className={`pt-status pt-status--${reading.tone}`}><Icon name={reading.tone === 'normal' ? 'check' : 'info'} size={14} />{reading.status}</p><p className="pt-reference">Reference: {reading.range}</p></li>)}</ul><div className="pt-reading-note">Example ranges supplied with these readings.<br />No comparable history is available to show a trend.</div></>}
  </Panel>;
}
