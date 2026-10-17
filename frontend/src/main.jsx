import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingHero } from './components/LandingHero.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';
import './index.css';

// Standalone design prototype: no production routes or authentication integration.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <main>
        <LandingHero />
      </main>
      <SiteFooter />
    </>
  </StrictMode>,
);
