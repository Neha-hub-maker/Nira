import { useEffect, useRef, useState } from 'react';
import { heroMedia } from './heroMedia.js';
import './LandingHero.css';

const IMAGE_DURATION = 6000;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function Icon({ name }) {
  const paths = {
    previous: <path d="m14 6-6 6 6 6" />,
    next: <path d="m10 6 6 6-6 6" />,
    pause: <><path d="M9 5v14M15 5v14" /></>,
    play: <path d="m9 5 10 7-10 7Z" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

function AccountAction({ href, children, primary = false }) {
  const className = `ht-hero__cta${primary ? ' ht-hero__cta--primary' : ''}`;
  // Never manufacture an authentication destination when the host app is absent.
  // The integration must supply its verified registration/login routes.
  return href ? (
    <a className={className} href={href}>
      {children}{primary && <Icon name="arrow" />}
    </a>
  ) : (
    <button className={className} type="button" disabled>
      {children}{primary && <Icon name="arrow" />}
    </button>
  );
}

export function LandingHero({ registerHref, loginHref }) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOTION_QUERY).matches,
  );
  const [paused, setPaused] = useState(reducedMotion);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [mediaError, setMediaError] = useState('');
  const videoRef = useRef(null);
  const remaining = useRef(IMAGE_DURATION);
  const playing = !paused && !hidden;
  const rotating = playing && !reducedMotion;
  const videoActive = active === 3;

  useEffect(() => {
    const query = window.matchMedia(MOTION_QUERY);
    const handleMotion = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPaused(true);
    };
    const handleVisibility = () => setHidden(document.hidden);
    query.addEventListener('change', handleMotion);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      query.removeEventListener('change', handleMotion);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    remaining.current = IMAGE_DURATION;
    setMediaError('');
    if (active === 3) {
      setVideoLoaded(true);
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [active]);

  useEffect(() => {
    if (!rotating || videoActive) return undefined;
    const deadline = performance.now() + remaining.current;
    const timer = window.setTimeout(() => {
      setActive((index) => (index + 1) % heroMedia.length);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, deadline - performance.now());
    };
  }, [active, rotating, videoActive]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return undefined;
    let cancelled = false;
    if (videoActive && playing) {
      if (element.ended) element.currentTime = 0;
      element.play().catch((error) => {
        if (!cancelled && error.name !== 'AbortError') {
          setPaused(true);
          setMediaError('Background video paused. Select play to try again or choose a photograph.');
        }
      });
    } else {
      element.pause();
    }
    return () => { cancelled = true; element.pause(); };
  }, [videoActive, playing, videoLoaded]);

  function selectSlide(index) {
    const next = (index + heroMedia.length) % heroMedia.length;
    setActive(next);
    setAnnouncement(`${heroMedia[next].label}, ${next + 1} of ${heroMedia.length}.`);
  }

  function pauseForKeyboard(event) {
    // Explicit activation of play is the only keyboard action that can resume.
    const explicitPlayback = event.target.closest('[data-playback-toggle]')
      && (event.key === 'Enter' || event.key === ' ');
    if (!explicitPlayback) setPaused(true);
    if (event.target.closest('[data-slide-controls]')) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        selectSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        selectSlide(event.key === 'Home' ? 0 : heroMedia.length - 1);
      }
    }
  }

  function handleMediaError(index) {
    if (index !== active) return;
    setPaused(true);
    setMediaError('This background could not load. Use the controls to choose another.');
  }

  const playbackDisabled = reducedMotion && !videoActive;
  const playbackLabel = playbackDisabled
    ? 'Automatic rotation disabled for reduced motion'
    : `${playing ? 'Pause' : 'Play'} ${reducedMotion ? 'background video' : 'background slideshow'}`;

  return (
    <section className="ht-hero" aria-labelledby="ht-hero-title"
      aria-roledescription="carousel" onKeyDownCapture={pauseForKeyboard}
      onFocusCapture={(event) => {
        if (event.target.matches(':focus-visible')) setPaused(true);
      }}>
      <div className="ht-hero__media" aria-hidden="true">
        {heroMedia.map((media, index) => (
          <div className={`ht-hero__slide ht-hero__slide--${index + 1}${
            (active === index && (index !== 3 || videoReady))
              || (videoActive && !videoReady && index === 2) ? ' is-active' : ''}`}
            key={media.src}>
            {media.type === 'image' ? (
              <img src={media.src} width={media.width} height={media.height} alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"
                onError={() => handleMediaError(index)} />
            ) : (
              <video ref={videoRef} src={videoLoaded || videoActive ? media.src : undefined}
                muted playsInline preload={videoLoaded || videoActive ? 'auto' : 'none'}
                tabIndex={-1} disablePictureInPicture
                disableRemotePlayback onError={() => handleMediaError(index)}
                onLoadedData={() => setVideoReady(true)}
                onEnded={() => {
                  if (rotating && videoActive) setActive(0);
                  else setPaused(true);
                }} />
            )}
          </div>
        ))}
      </div>
      <div className="ht-hero__veil" aria-hidden="true" />

      <div className="ht-hero__brand" aria-label="HealthTrac">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <path d="M15 3v24M3 15h24" stroke="currentColor" strokeWidth="1.5" />
          <path d="m6.5 6.5 17 17m-17 0 17-17" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="15" cy="15" r="4.5" fill="currentColor" />
        </svg>
        <span>HealthTrac</span>
      </div>

      <div className="ht-hero__content">
        <h1 id="ht-hero-title">Your health history,<br className="ht-hero__desktop-break" />{' '}
          <em>beautifully connected.</em>
        </h1>
        <p>Keep your medical records together, understand your health over time, and share selected information with your doctor.</p>
        <div className="ht-hero__actions">
          <AccountAction href={registerHref} primary>Create your account</AccountAction>
          <AccountAction href={loginHref}>Log in</AccountAction>
        </div>
      </div>

      <div className="ht-hero__footer">
        <span className="ht-hero__counter" aria-hidden="true">
          <span>0{active + 1}</span><span className="ht-hero__counter-line" /><span>04</span>
        </span>
        <div className="ht-hero__controls" role="group" aria-label="Background media controls" data-slide-controls>
          <button type="button" className="ht-hero__round" aria-label="Previous background"
            onClick={() => selectSlide(active - 1)}><Icon name="previous" /></button>
          <div className="ht-hero__indicators" role="group" aria-label="Choose background">
            {heroMedia.map((media, index) => (
              <button type="button" key={media.src}
                className={`ht-hero__indicator${active === index ? ' is-active' : ''}`}
                aria-label={`Show ${media.label.toLowerCase()}, ${index + 1} of 4`}
                aria-current={active === index ? 'true' : undefined}
                onClick={() => selectSlide(index)}><span /></button>
            ))}
          </div>
          <button type="button" className="ht-hero__round" aria-label="Next background"
            onClick={() => selectSlide(active + 1)}><Icon name="next" /></button>
          <span className="ht-hero__control-divider" aria-hidden="true" />
          <button type="button" className="ht-hero__round ht-hero__playback" data-playback-toggle
            disabled={playbackDisabled} aria-label={playbackLabel}
            onClick={() => { setMediaError(''); setPaused((value) => !value); }}>
            <Icon name={playing && !playbackDisabled ? 'pause' : 'play'} />
          </button>
        </div>
      </div>
      <span className="ht-hero__sr-only" role="status">{mediaError || announcement}</span>
    </section>
  );
}
