const paths = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  record: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 12h6M9 16h6" /></>,
  history: <><path d="M4 5v5h5M4.5 9a8 8 0 1 1-.2 6M12 7v5l3 2" /></>,
  readings: <><path d="M3 19h18M6 15v-4M12 15V5M18 15V8" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.5" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  care: <><path d="M20 8c0 5-8 11-8 11S4 13 4 8a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 8Z" /><path d="M8 11h3l1-3 2 6 1-3h2" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
};

export function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.record}</svg>;
}

export function Brand() {
  return <span className="pt-brand"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M15 3v24M3 15h24m-20.5-8.5 17 17m-17 0 17-17" stroke="currentColor" strokeWidth="1.5" /><circle cx="15" cy="15" r="4.5" fill="currentColor" /></svg><span>HealthTrac</span></span>;
}
