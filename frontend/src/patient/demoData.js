// Isolated fictional presentation fixtures. Never merge these with patient API data.
// Reference ranges/statuses below are supplied examples, not calculated clinical advice.
export const demoPatient = { name: 'Avery Morgan', firstName: 'Avery', initials: 'AM', label: 'Fictional demo patient' };
export const demoRecords = [
  { id: 'blood', title: 'Routine blood test', category: 'Lab report', date: '2026-06-12', uploaded: '2026-06-13', description: 'Example laboratory report containing the hemoglobin and vitamin D readings shown on this overview.' },
  { id: 'visit', title: 'Follow-up visit notes', category: 'Clinical notes', date: '2026-06-08', uploaded: '2026-06-08', description: 'Example notes from a routine blood pressure follow-up appointment.' },
  { id: 'prescription', title: 'Medication review', category: 'Prescription', date: null, uploaded: '2026-06-02', description: 'Example prescription record. A clinical date was not supplied; its upload date is shown separately.' },
];
export const demoJourneys = [
  { id: 'bp', title: 'Blood pressure follow-up', type: 'Chronic care', start: '2026-04-14', description: 'Appointment notes and readings, kept together.' },
  { id: 'recovery', title: 'Knee surgery recovery', type: 'Surgical care', start: '2026-05-20', description: 'A place for your recovery records and follow-ups.' },
];
export const demoReadings = [
  { id: 'hb', name: 'Hemoglobin', value: '13.2', unit: 'g/dL', date: '2026-06-12', range: '12.0–15.5 g/dL', status: 'Within supplied range', tone: 'normal' },
  { id: 'vitd', name: 'Vitamin D', value: '24', unit: 'ng/mL', date: '2026-06-12', range: '30–100 ng/mL', status: 'Below supplied range', tone: 'low' },
];
