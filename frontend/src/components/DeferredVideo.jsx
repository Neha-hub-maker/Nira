import { useEffect, useRef, useState } from 'react';

// A decorative film with an explicit control and an original-media poster.
// No source is attached until near the viewport (or explicitly requested).
export function DeferredVideo({ src, poster, id, label }) {
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState('');
  const load = near && (!reduced || manual);
  const play = load && visible && !paused && !hidden && !failed;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      setReduced(query.matches);
      if (query.matches) { setPaused(true); setManual(false); }
    };
    const onVisibility = () => setHidden(document.hidden);
    query.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    let loadingObserver;
    let playbackObserver;
    if ('IntersectionObserver' in window) {
      loadingObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setNear(true); loadingObserver.disconnect(); }
      }, { rootMargin: '300px 0px' });
      playbackObserver = new IntersectionObserver(([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio >= .2);
      }, { threshold: [0, .2] });
      loadingObserver.observe(playerRef.current);
      playbackObserver.observe(playerRef.current);
    } else { setNear(true); setVisible(true); }
    return () => {
      query.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      loadingObserver?.disconnect(); playbackObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    let cancelled = false;
    if (play) {
      if (element.ended) element.currentTime = 0;
      element.play().catch((error) => {
        if (!cancelled && error.name !== 'AbortError') {
          setPaused(true); setMessage('Playback is paused. Select play to try again.');
        }
      });
    } else element.pause();
    return () => { cancelled = true; element.pause(); };
  }, [play]);

  return (
    <div className="ct-film__player" ref={playerRef} role="group" aria-label={label}>
      {failed && <img className="ct-film__fallback" src={poster} alt="" />}
      <video ref={videoRef} id={id} src={load ? src : undefined} poster={poster}
        className={failed ? 'ct-film__video ct-film__video--failed' : 'ct-film__video'}
        muted playsInline preload={load ? 'metadata' : 'none'} aria-hidden="true" tabIndex={-1}
        disablePictureInPicture disableRemotePlayback onEnded={() => setPaused(true)}
        onError={() => { setFailed(true); setPaused(true); setMessage('Video unavailable. Its still photograph is shown.'); }} />
      <button className="ct-film__control" type="button" aria-controls={id}
        onClick={() => {
          setMessage('');
          if (play) setPaused(true);
          else {
            if (failed) { setFailed(false); videoRef.current.load(); }
            setManual(true); setPaused(false);
          }
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {play ? <path d="M9 5v14M15 5v14" /> : <path d="m9 5 10 7-10 7Z" />}
        </svg>
        {play ? 'Pause video' : 'Play video'}
      </button>
      <span className="ct-sr-only" role="status">{message}</span>
    </div>
  );
}
