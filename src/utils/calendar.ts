import { RSVPResponse } from '../types/rsvp';

const WEDDING_LOCATION = 'Nyali, Mombasa, Kenya';

export function downloadIcsFile() {
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Carol and Tim Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'SUMMARY:Carol & Tim Wedding Celebration',
    'DESCRIPTION:Wedding celebration of Carol & Tim in Nyali. Dress code: Formal / Elegant.',
    `LOCATION:${WEDDING_LOCATION}`,
    'DTSTART:20261024T130000Z',
    'DTEND:20261024T210000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'carol-tim-wedding-oct24.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getGoogleCalendarUrl(): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent('Carol & Tim Wedding Celebration');
  const details = encodeURIComponent(
    'Celebration of the marriage of Carol & Tim.\n\nDate: Saturday, October 24, 2026\nLocation: Nyali, Mombasa, Kenya'
  );
  const location = encodeURIComponent(WEDDING_LOCATION);
  const dates = '20261024T130000Z/20261024T210000Z';
  return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}

export function exportRSVPsToCSV(rsvps: RSVPResponse[]) {
  const headers = [
    'Confirmation Code',
    'Status',
    'Total Headcount',
    'Primary First Name',
    'Primary Last Name',
    'Phone',
    'Note to Couple',
    'Submission Date',
  ];

  const rows = rsvps.map((r) => [
    `"${r.confirmationCode}"`,
    `"${r.attending === 'yes' ? 'Attending' : 'Declined'}"`,
    r.guestCount,
    `"${r.primaryGuest.firstName}"`,
    `"${r.primaryGuest.lastName}"`,
    `"${r.primaryGuest.phone || ''}"`,
    `"${(r.noteToCouple || '').replace(/"/g, '""')}"`,
    `"${r.submittedAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `carol-tim-wedding-guest-list-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
