import { useRef, useState } from 'react';
import { Brand, Icon } from './Icon.jsx';

const previewDestinations = [
  { id: 'overview', label: 'Overview', icon: 'overview', href: '#overview' },
  { id: 'records', label: 'Medical Records', icon: 'record', href: '#recent-records' },
  { id: 'history', label: 'Health History', icon: 'history', href: '#care-journeys' },
  { id: 'readings', label: 'Results & Trends', icon: 'readings', href: '#latest-readings' },
  { id: 'share', label: 'Share with a Doctor', icon: 'share', dependency: 'share' },
  { id: 'profile', label: 'Profile & Plan', icon: 'profile', dependency: 'profile' },
];

// Presentation shell: caller owns all data and availability decisions.
export function AppShell({ patient, onUnavailable, children, navigation = previewDestinations, currentDestination = 'overview', pageTitle = 'Overview', mainId = 'overview', navigationHint = 'Records, history and results link to sections of this overview.' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  function navigate(event, destination) {
    if (!destination.href) { onUnavailable(destination.dependency); return; }
    setMenuOpen(false);
    if (!destination.href.startsWith('#')) return;
    event.preventDefault();
    const target = document.getElementById(destination.href.slice(1));
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'start' });
    window.history.replaceState(null, '', destination.href);
  }
  return (
    <div className="pt-app">
      <a className="pt-skip" href={`#${mainId}`}>Skip to {pageTitle.toLowerCase()}</a>
      <aside className="pt-sidebar" onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
      }}>
        <div className="pt-sidebar__top"><a href="./" className="pt-brand-link" aria-label="HealthTrac public home"><Brand /></a>
          <button ref={menuButton} className="pt-menu-button" aria-expanded={menuOpen} aria-controls="patient-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} />{menuOpen ? 'Close' : 'Menu'}</button>
        </div>
        <div className={`pt-sidebar__body${menuOpen ? ' is-open' : ''}`} id="patient-navigation">
          <p className="pt-overline pt-sidebar__label">YOUR HEALTH SPACE</p>
          <nav aria-label="Patient navigation">{navigation.map((destination) => {
            const isCurrent = destination.id === currentDestination;
            const content = <><Icon name={destination.icon} /><span>{destination.label}</span>{isCurrent && <span className="pt-nav-dot" />}</>;
            return destination.href
              ? <a key={destination.label} href={destination.href} aria-current={isCurrent ? 'page' : undefined} onClick={(event) => navigate(event, destination)}>{content}</a>
              : <button key={destination.label} onClick={(event) => navigate(event, destination)}>{content}</button>;
          })}</nav>
          {navigationHint && <p className="pt-sidebar__hint">{navigationHint}</p>}
          <div className="pt-sidebar__bottom"><span className="pt-overline">A LITTLE MORE CLARITY</span><p>Your records.<br />Your story. Together.</p><a href="./consultation.html">Prepare for a consultation<Icon name="arrow" size={17} /></a></div>
        </div>
      </aside>
      <div className="pt-workspace">
        <header className="pt-topbar"><div className="pt-breadcrumb">Patient space<span aria-hidden="true">/</span><strong>{pageTitle}</strong></div><div className="pt-patient"><span className="pt-avatar" aria-hidden="true">{patient.initials}</span><span>{patient.name}<small>{patient.label}</small></span></div></header>
        {children}
      </div>
    </div>
  );
}
