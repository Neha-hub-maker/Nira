import { SiteHeader } from '../components/SiteHeader.jsx';
import { SharingPreview } from '../components/SharingPreview.jsx';
import { DeferredVideo } from '../components/DeferredVideo.jsx';
import { followSection } from '../components/sectionNavigation.js';
import { consultationMedia } from './consultationMedia.js';
import './ConsultationPage.css';

export function ConsultationPage() {
  return (
    <div className="ht-consultation" id="top" tabIndex={-1}>
      <SiteHeader page="consultation" />
      <section className="ct-opening ct-editorial" id="consultation-introduction" tabIndex={-1} aria-labelledby="consultation-title" data-consultation-media="opening">
        <div className="ct-editorial__copy">
          <p className="ct-eyebrow">PREPARE FOR YOUR CONSULTATION</p>
          <h1 id="consultation-title">Walk into your next appointment <em>prepared.</em></h1>
          <p className="ct-description">Bring your medical history together. Find the reports, notes, and questions that help you share relevant context with your doctor.</p>
          <a className="ct-button" href="#sharing-preview" onClick={followSection}>Explore sharing
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" /></svg>
          </a>
        </div>
        <figure className="ct-photo ct-opening__photo">
          <img src={consultationMedia.firstImage} width="3840" height="2160" loading="eager" fetchPriority="high" decoding="async"
            alt="A doctor and an adult talking across a desk during a consultation." />
          <figcaption>A little context. More space for the conversation.</figcaption>
        </figure>
      </section>

      <section className="ct-preparation ct-editorial" id="preparation" tabIndex={-1} aria-labelledby="preparation-title" data-consultation-media="preparation">
        <figure className="ct-photo ct-preparation__photo">
          <img src={consultationMedia.secondImage} width="3840" height="2160" loading="lazy" decoding="async"
            alt="A doctor and an older adult reviewing a medical image together." />
          <figcaption>Keep the details you want to discuss close by.</figcaption>
        </figure>
        <div className="ct-editorial__copy">
          <p className="ct-eyebrow">BEFORE YOU GO</p>
          <h2 id="preparation-title">A few small steps.<br />A more thoughtful <em>start.</em></h2>
          <ol className="ct-checklist">
            <li><span aria-hidden="true">01</span><div><h3>Find your reports</h3><p>Gather relevant reports and note their dates.</p></div></li>
            <li><span aria-hidden="true">02</span><div><h3>Review your history</h3><p>Make a short list of current medicines, past care, and changes you want to discuss.</p></div></li>
            <li><span aria-hidden="true">03</span><div><h3>Prepare your questions</h3><p>Write down what you want to understand and what you would like to ask next.</p></div></li>
          </ol>
        </div>
      </section>

      <SharingPreview />

      <section className="ct-film" id="consultation-video" tabIndex={-1} aria-labelledby="consultation-film-title" data-consultation-media="video">
        <div className="ct-film__copy">
          <p className="ct-eyebrow">A CLEARER CONVERSATION</p>
          <h2 id="consultation-film-title">Make room for<br />the <em>conversation.</em></h2>
          <p>Keep relevant context close, and leave space for the questions that matter to you.</p>
        </div>
        <DeferredVideo src={consultationMedia.video} poster={consultationMedia.poster}
          id="consultation-film" label="Consultation illustration video" />
      </section>
    </div>
  );
}
