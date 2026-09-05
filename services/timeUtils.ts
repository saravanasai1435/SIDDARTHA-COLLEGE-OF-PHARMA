/**
 * 12-Hour Time Utilities for Institutional Timetable
 */

export function formatTo12Hour(timeStr?: string, padZero: boolean = true): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // Check if string matches colon format: HH:MM or HH:MM AM/PM
  const matchColon = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/);
  if (matchColon) {
    let hours = parseInt(matchColon[1], 10);
    const minutes = matchColon[2];
    const ampm = matchColon[3]?.toUpperCase();

    if (ampm) {
      if (hours > 12) hours = hours % 12;
      if (hours === 0) hours = 12;
      const hStr = padZero ? String(hours).padStart(2, '0') : String(hours);
      return `${hStr}:${minutes} ${ampm}`;
    } else {
      const modifier = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const hStr = padZero ? String(hours).padStart(2, '0') : String(hours);
      return `${hStr}:${minutes} ${modifier}`;
    }
  }

  // Check if string matches dot format: HH.MM or HH.MM AM/PM
  const matchDot = trimmed.match(/^(\d{1,2})\.(\d{2})\s*([AaPp][Mm])?$/);
  if (matchDot) {
    let hours = parseInt(matchDot[1], 10);
    const minutes = matchDot[2];
    const ampm = matchDot[3]?.toUpperCase();

    if (ampm) {
      if (hours > 12) hours = hours % 12;
      if (hours === 0) hours = 12;
      const hStr = padZero ? String(hours).padStart(2, '0') : String(hours);
      return `${hStr}:${minutes} ${ampm}`;
    } else {
      const modifier = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const hStr = padZero ? String(hours).padStart(2, '0') : String(hours);
      return `${hStr}:${minutes} ${modifier}`;
    }
  }

  return trimmed;
}

export function formatSlotRange(start?: string, end?: string): string {
  if (!start && !end) return '--';
  const fStart = formatTo12Hour(start);
  const fEnd = formatTo12Hour(end);
  if (fStart && fEnd) return `${fStart} - ${fEnd}`;
  return fStart || fEnd || '--';
}
