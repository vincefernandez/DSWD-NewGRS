// Editable content for the NewGRS User System Review site.
// Update this file (not the markup) to change the agenda, downloads and photos.

export const event = {
  title: 'Grievance Redress System Workflow Automation (NewGRS) User System Review',
  region: 'Region III',
  dateRange: '3–6 November 2026',
  location: 'DSWD Region III',
  attendees: '251',
  // Replace with your Google Form / registration link:
  registerUrl: '#register',
  // Replace with the shared Google Drive folder link:
  driveUrl: 'https://drive.google.com/',
};

export const agenda = [
  {
    day: 'Day 1',
    title: 'Opening',
    items: ['Registration and opening program', 'Overview of NewGRS and objectives'],
  },
  {
    day: 'Day 2',
    title: 'System Encoding',
    items: [
      'Opening to Topics',
      'Topics and System Encoding',
      'Processed Implementation Encoding',
      'Topics in Workflow Simulations',
      'Reporting & Closing',
    ],
  },
  {
    day: 'Day 3',
    title: 'Workflow Simulations',
    items: ['Grievance intake and routing simulation', 'Case escalation and resolution walkthrough'],
  },
  {
    day: 'Day 4',
    title: 'Reporting & Closing',
    items: ['Reports and dashboards review', 'Feedback, action points and closing'],
  },
];

// type: pdf | pptx | xlsx. Set `href` to each file's Google Drive link.
export const materials = [
  { name: 'NewGRS Manual.pdf', type: 'pdf', action: 'Download Manual', href: '#' },
  { name: 'NewGRS Manual (Tagalog).pdf', type: 'pdf', action: 'Download Manual', href: '#' },
  { name: 'NewGRS Manual.pptx', type: 'pptx', action: 'Download Slides', href: '#' },
  { name: 'Simulation Dataset.xlsx', type: 'xlsx', action: 'Download Slides', href: '#' },
  { name: 'NewGRS Quick Guide.pdf', type: 'pdf', action: 'Download Manual', href: '#' },
  { name: 'NewGRS Slides.pdf', type: 'pptx', action: 'Download Slides', href: '#' },
  { name: 'Simulation Dataset 2.xlsx', type: 'xlsx', action: 'Download Slides', href: '#' },
  { name: 'Simulation Dataset 3.xlsx', type: 'xlsx', action: 'Download Slides', href: '#' },
];

// Add real photos to src/assets/photos/ and list them here, e.g.
// { src: new URL('./assets/photos/day1.jpg', import.meta.url).href, alt: 'Opening program' }
// Until then, the gallery shows colored placeholders.
export const photos = Array.from({ length: 10 }, (_, i) => ({
  src: null,
  alt: `Event photo ${i + 1}`,
  hue: 205 + ((i * 17) % 50),
}));
