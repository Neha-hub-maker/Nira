import './SiteHeader.css';

export function SiteHeader({ page = 'home', overlay = false }) {
  return (
    <header className={`ht-site-header${overlay ? ' ht-site-header--overlay' : ''}`}>
      <div className="ht-site-header__wordmark" aria-label="HealthTrac">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <path d="M15 3v24M3 15h24m-20.5-8.5 17 17m-17 0 17-17" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="15" cy="15" r="4.5" fill="currentColor" />
        </svg>
        <span>HealthTrac</span>
      </div>
      <nav aria-label="Primary navigation">
        <a href="./" aria-current={page === 'home' ? 'page' : undefined}>Home</a>
        <a href="./consultation.html" aria-current={page === 'consultation' ? 'page' : undefined}>
          <span className="ht-site-header__long-label">Prepare for your consultation</span>
          <span className="ht-site-header__short-label">Consultation</span>
        </a>
        <a href="./dashboard.html">Dashboard preview</a>
      </nav>
    </header>
  );
}
