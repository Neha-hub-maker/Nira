import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConsultationPage } from './pages/ConsultationPage.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <main><ConsultationPage /></main>
      <SiteFooter page="consultation" />
    </>
  </StrictMode>,
);
