import './SiteFooter.css';

const sections = [
  { href: '#top', label: 'Your health history' },
  { href: '#records', label: 'Records & insights' },
  { href: '#everyday', label: 'Health, in everyday life' },
  { href: '#closing', label: 'The story continues' },
];

function followSection(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(event.currentTarget.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  });
  window.history.replaceState(null, '', event.currentTarget.hash);
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ht-footer" aria-label="HealthTrac footer">
      <div className="ht-footer__container">
        <div className="ht-footer__columns">
          <div className="ht-footer__brand-column">
            <div className="ht-footer__wordmark" aria-label="HealthTrac">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path d="M15 3v24M3 15h24m-20.5-8.5 17 17m-17 0 17-17" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="15" cy="15" r="4.5" fill="currentColor" />
              </svg>
              <span>HealthTrac</span>
            </div>
            <p className="ht-footer__tagline">Your medical records.<br />{' '}Your health story. Together.</p>
          </div>

          <nav className="ht-footer__explore" aria-labelledby="footer-explore-title">
            <h2 id="footer-explore-title">Explore</h2>
            <ul>
              {sections.map(({ href, label }) => (
                <li key={href}><a href={href} onClick={followSection}>{label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="ht-footer__information">
            <h2>Information</h2>
            <ul>
              <li><span className="ht-footer__policy">Privacy Policy</span><span className="ht-footer__soon">Coming soon</span></li>
              <li><span className="ht-footer__policy">Terms of Use</span><span className="ht-footer__soon">Coming soon</span></li>
            </ul>
          </div>
        </div>

        <div className="ht-footer__bottom">
          <p>© {year} HealthTrac</p>
          <a className="ht-footer__back" href="#top" onClick={followSection}>
            Back to top
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20V4m-6 6 6-6 6 6" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
