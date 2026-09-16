import { AppState, InstitutionConfig, StaffMember, Subject, ClassRoom, TimetableEntry, AdminSettings } from '../types';
import { ALL_CLASSES } from './timetableData/classes';
import { ALL_STAFF } from './timetableData/staff';
import { ALL_SUBJECTS } from './timetableData/subjects';
import { BPHARM_ENTRIES } from './timetableData/bpharmEntries';
import { PHARMD_ENTRIES } from './timetableData/pharmdEntries';

export const FRESH_INSTITUTION_CONFIG: InstitutionConfig = {
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  periodsPerDay: 9,
  academicYear: '2026-27',
  term: 'Academic Year 2026-27 (KVSRSCOPS/ACD/TT)',
  timeSlots: [
    // Weekday Slots (Mon - Fri)
    { id: 'slot-1', label: 'Period 1', start: '09:30 AM', end: '10:20 AM', isBreak: false },
    { id: 'slot-2', label: 'Period 2', start: '10:20 AM', end: '11:10 AM', isBreak: false },
    { id: 'slot-3', label: 'Period 3', start: '11:10 AM', end: '12:00 PM', isBreak: false },
    { id: 'slot-4', label: 'Period 4', start: '12:00 PM', end: '12:50 PM', isBreak: false },
    { id: 'slot-lunch', label: 'Lunch Break', start: '12:50 PM', end: '02:00 PM', isBreak: true },
    { id: 'slot-5', label: 'Period 5', start: '02:00 PM', end: '02:50 PM', isBreak: false },
    { id: 'slot-6', label: 'Period 6', start: '02:50 PM', end: '03:40 PM', isBreak: false },
    { id: 'slot-7', label: 'Period 7', start: '03:40 PM', end: '04:30 PM', isBreak: false },
    { id: 'slot-8', label: 'Remedial 1', start: '04:30 PM', end: '05:00 PM', isBreak: false },
    { id: 'slot-9', label: 'Remedial 2', start: '05:00 PM', end: '05:30 PM', isBreak: false },
    // Saturday Slots
    { id: 'sat-1', label: 'Period 1 (Sat)', start: '08:30 AM', end: '09:20 AM', isBreak: false },
    { id: 'sat-2', label: 'Period 2 (Sat)', start: '09:20 AM', end: '10:10 AM', isBreak: false },
    { id: 'sat-3', label: 'Period 3 (Sat)', start: '10:10 AM', end: '11:00 AM', isBreak: false },
    { id: 'sat-4', label: 'Period 4 (Sat)', start: '11:00 AM', end: '11:50 AM', isBreak: false },
    { id: 'sat-5', label: 'Period 5 (Sat)', start: '11:50 AM', end: '12:40 PM', isBreak: false },
    { id: 'sat-6', label: 'Period 6 (Sat)', start: '12:40 PM', end: '01:15 PM', isBreak: false }
  ]
};

export const FRESH_CLASSES: ClassRoom[] = ALL_CLASSES;
export const FRESH_SUBJECTS: Subject[] = ALL_SUBJECTS;
export const FRESH_STAFF: StaffMember[] = ALL_STAFF;
export const FRESH_TIMETABLE: TimetableEntry[] = [...BPHARM_ENTRIES, ...PHARMD_ENTRIES];

export const getFreshInitialState = (customSettings?: Partial<AdminSettings>): AppState => {
  return {
    config: FRESH_INSTITUTION_CONFIG,
    classes: FRESH_CLASSES,
    subjects: FRESH_SUBJECTS,
    staff: FRESH_STAFF,
    timetable: FRESH_TIMETABLE,
    attendance: [],
    leaves: [],
    substitutions: [],
    logs: [
      {
        id: 'log-seed-1',
        timestamp: '2026-09-03 09:00:00',
        user: 'system',
        action: 'Official 2026-27 Master Timetables synchronized for B. Pharm (I, II, III, IV) and Pharm. D (I, II, III, IV, V)'
      }
    ],
    settings: {
      googleLoginEnabled: false,
      approvedEmails: ['admin@siddartha.edu'],
      googleClientId: '',
      googleClientSecret: '',
      adminUsername: 'admin',
      adminPassword: 'password123',
      principalUsername: '1234',
      principalPassword: '1234',
      cloudDbEnabled: true,
      googleSheetWebAppUrl: 'https://script.google.com/macros/s/AKfycbx8_TxBONe9Lu_L9TLtz7-ouYFceGA8hfrcAKf1OBZtTDstftr3p_5ll1E3gQF2QjzR/exec',
      ...customSettings
    }
  };
};
