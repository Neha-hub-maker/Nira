import { useEffect, useRef, useState } from 'react';
import { heroMedia, videoPoster } from './heroMedia.js';
import './LandingHero.css';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function Arrow({ down = false }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {down ? <path d="M12 4v16m-6-6 6 6 6-6" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}
    </svg>
  );
}

function Brand() {
  return (
    <div className="ht-hero__brand" aria-label="HealthTrac">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M15 3v24M3 15h24m-20.5-8.5 17 17m-17 0 17-17" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15" cy="15" r="4.5" fill="currentColor" />
      </svg>
      <span>HealthTrac</span>
    </div>
  );
}

function RecordPreview() {
  return (
    <figure className="ht-record" aria-labelledby="record-caption">
      <div className="ht-record__topline">
        <span>PERSONAL RECORD</span><span className="ht-record__badge">Example</span>
      </div>
      <div className="ht-record__title-row">
        <span className="ht-record__icon" aria-hidden="true">
          <svg width="23" height="25" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M5 2h10l5 5v17H5V2Zm10 0v6h5M9 13h7m-7 4h7" />
          </svg>
        </span>
        <div><h3>Routine blood test</h3><p>Avery Morgan · 12 Jun 2026</p></div>
      </div>
      <dl className="ht-record__results">
        <div><dt>Hemoglobin</dt><dd>13.2 <span>g/dL</span></dd></div>
        <div><dt>Vitamin D</dt><dd>32 <span>ng/mL</span></dd></div>
      </dl>
      <div className="ht-record__note"><span>A NOTE FOR NEXT TIME</span>
        <p>Ask about comparing this report with last year’s results.</p>
      </div>
      <figcaption id="record-caption">Illustrative preview. All names and values are fictional.</figcaption>
    </figure>
  );
}

function VideoChapter() {
  const chapterRef = useRef(null);
  const videoRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOTION_QUERY).matches,
  );
  const [paused, setPaused] = useState(false);
  const [manualPlayback, setManualPlayback] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [message, setMessage] = useState('');
  const shouldLoad = nearViewport && (!reducedMotion || manualPlayback);
  const playRequested = !paused && (!reducedMotion || manualPlayback);
  const shouldPlay = shouldLoad && visible && playRequested && !hidden;

  useEffect(() => {
    const query = window.matchMedia(MOTION_QUERY);
    const handleMotion = () => {
      setReducedMotion(query.matches);
      if (query.matches) { setPaused(true); setManualPlayback(false); }
    };
    const handleVisibility = () => setHidden(document.hidden);
    query.addEventListener('change', handleMotion);
    document.addEventListener('visibilitychange', handleVisibility);
    if (!('IntersectionObserver' in window)) {
      setNearViewport(true); setVisible(true);
      return () => {
        query.removeEventListener('change', handleMotion);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    }
    const loadingObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearViewport(true); loadingObserver.disconnect(); }
    }, { rootMargin: '300px 0px' });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio >= .2);
    }, { threshold: [0, .2] });
    loadingObserver.observe(chapterRef.current);
    playbackObserver.observe(chapterRef.current);
    return () => {
      loadingObserver.disconnect(); playbackObserver.disconnect();
      query.removeEventListener('change', handleMotion);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    let cancelled = false;
    if (shouldPlay) {
      if (element.ended) element.currentTime = 0;
      element.play().catch((error) => {
        if (!cancelled && error.name !== 'AbortError') {
          setPaused(true);
          setMessage('Playback is paused. Select play to try again.');
        }
      });
    } else element.pause();
    return () => { cancelled = true; element.pause(); };
  }, [shouldPlay]);

  return (
    <section id="closing" tabIndex={-1} ref={chapterRef} className="ht-closing" aria-labelledby="closing-title" data-chapter="video">
      <video id="closing-video" ref={videoRef} className="ht-closing__video" poster={videoPoster}
        src={shouldLoad ? heroMedia[3].src : undefined} preload={shouldLoad ? 'metadata' : 'none'}
        muted playsInline disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-hidden="true"
        onEnded={() => setPaused(true)}
        onError={() => { setPaused(true); setMessage('The video is unavailable. Its still photograph is shown.'); }} />
      <div className="ht-closing__veil" aria-hidden="true" />
      <div className="ht-closing__content">
        <p className="ht-eyebrow">THE STORY CONTINUES</p>
        <h2 id="closing-title">More room<br />for <em>living.</em></h2>
        <p>A little clarity for whatever comes next.</p>
      </div>
      <button type="button" className="ht-video-control" aria-controls="closing-video"
        onClick={() => {
          setMessage('');
          if (shouldPlay) setPaused(true);
          else { setManualPlayback(true); setPaused(false); }
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {shouldPlay ? <path d="M9 5v14M15 5v14" /> : <path d="m9 5 10 7-10 7Z" />}
        </svg>
        {shouldPlay ? 'Pause video' : 'Play video'}
      </button>
      <span className="ht-sr-only" role="status">{message}</span>
    </section>
  );
}

export function LandingHero() {
  function explore(event) {
    event.preventDefault();
    const section = document.getElementById('records');
    section.focus({ preventScroll: true });
    section.scrollIntoView({
      behavior: window.matchMedia(MOTION_QUERY).matches ? 'instant' : 'smooth', block: 'start',
    });
    window.history.replaceState(null, '', '#records');
  }

  return (
    <div className="ht-introduction">
      <section id="top" tabIndex={-1} className="ht-hero" aria-labelledby="ht-hero-title" data-chapter="opening">
        <img className="ht-hero__image" src={heroMedia[0].src} width="5472" height="3648"
          alt="" loading="eager" fetchPriority="high" decoding="async" />
        <div className="ht-hero__veil" aria-hidden="true" />
        <Brand />
        <div className="ht-hero__content">
          <h1 id="ht-hero-title">Your health history,<br className="ht-hero__desktop-break" />{' '}
            <em>beautifully connected.</em></h1>
          <p>A thoughtful place for your records, your questions, and the story only you can tell.</p>
          <a className="ht-explore" href="#records" onClick={explore}>Explore HealthTrac <Arrow down /></a>
        </div>
        <span className="ht-hero__footnote">A fuller picture starts with your story.</span>
      </section>

      <section id="records" className="ht-editorial ht-records" tabIndex={-1}
        aria-labelledby="records-title" data-chapter="records">
        <figure className="ht-editorial__photo ht-records__photo">
          <img src={heroMedia[1].src} width="3840" height="2160" loading="lazy" decoding="async"
            alt="A person at home looking at a phone." />
          <figcaption>A moment to make sense of the details.</figcaption>
        </figure>
        <div className="ht-editorial__copy">
          <p className="ht-eyebrow">RECORDS & INSIGHTS</p>
          <h2 id="records-title">Your records.<br />A little more <em>clarity.</em></h2>
          <p className="ht-editorial__description">Reports, notes, and the details you want to revisit. An overview alongside the record it came from, with space for your next question.</p>
          <RecordPreview />
        </div>
      </section>

      <section id="everyday" tabIndex={-1} className="ht-editorial ht-everyday" aria-labelledby="everyday-title" data-chapter="everyday">
        <div className="ht-editorial__copy">
          <p className="ht-eyebrow">HEALTH, IN EVERYDAY LIFE</p>
          <h2 id="everyday-title">For you.<br />For the people<br />you <em>care about.</em></h2>
          <p className="ht-editorial__description">Your own records. The family information you help look after. A little organization for the many parts of everyday life.</p>
          <div className="ht-everyday__note">
            <svg width="34" height="34" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <path d="M15 3v24M3 15h24m-20.5-8.5 17 17m-17 0 17-17" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="15" cy="15" r="3" fill="currentColor" />
            </svg>
            <p>Keep the details together.<br />Leave space for the moments between.</p>
          </div>
        </div>
        <figure className="ht-editorial__photo ht-everyday__photo">
          <img src={heroMedia[2].src} width="5760" height="3840" loading="lazy" decoding="async"
            alt="Two people enjoying a walk together outdoors." />
          <figcaption>There is a whole life around every health story.</figcaption>
        </figure>
      </section>

      <VideoChapter />
    </div>
  );
}
