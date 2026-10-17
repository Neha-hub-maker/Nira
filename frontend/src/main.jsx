import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingHero } from './components/LandingHero.jsx';
import './index.css';

// Supply confirmed destinations when authentication is added to this fresh frontend.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main>
      <LandingHero
        registerHref={import.meta.env.VITE_REGISTER_URL}
        loginHref={import.meta.env.VITE_LOGIN_URL}
      />
    </main>
  </StrictMode>,
);
