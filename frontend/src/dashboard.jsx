import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './patient/Dashboard.jsx';
import './patient/patient.css';

createRoot(document.getElementById('root')).render(<StrictMode><Dashboard /></StrictMode>);
