
import { AppState, AdminSettings } from '../types';
import { saveStateToFirestore } from './firebaseService';
import { getFreshInitialState, FRESH_INSTITUTION_CONFIG, FRESH_CLASSES, FRESH_SUBJECTS, FRESH_TIMETABLE, FRESH_STAFF } from './freshTimetableData';
import { generateDefaultStudents, generateSampleSessionsAndAttendance } from './attendanceService';
import { formatTo12Hour } from './timeUtils';

const KEYS = {
  STATE: 'kvsc_enterprise_state_2026_institutional_v3_nostudents',
  AUTH: 'sc_auth_session',
  ROLE: 'sc_auth_role'
};

const DEFAULT_SETTINGS: AdminSettings = {
  googleLoginEnabled: false,
  approvedEmails: ['admin@siddartha.edu'],
  googleClientId: '',
  googleClientSecret: '',
  adminUsername: 'admin',
  adminPassword: 'password123',
  principalUsername: '1234',
  principalPassword: '1234',
  cloudDbEnabled: true,
  googleSheetWebAppUrl: ''
};

export const INITIAL_STATE: AppState = getFreshInitialState(DEFAULT_SETTINGS);

export const resetToFreshPhotoData = (): AppState => {
  const fresh = getFreshInitialState(DEFAULT_SETTINGS);
  localStorage.setItem(KEYS.STATE, JSON.stringify(fresh));
  try {
    saveStateToFirestore(fresh).catch(err => {
      console.warn("Safety Firestore automatic sync failed:", err);
    });
  } catch (e) {
    console.warn("Safety Firestore automatic sync error:", e);
  }
  return fresh;
};

export const getState = (): AppState => {
  const data = localStorage.getItem(KEYS.STATE);
  if (!data) {
    // Initialize fresh
    saveState(INITIAL_STATE);
    return INITIAL_STATE;
  }
  try {
    const parsed = JSON.parse(data);
    // If old staff like Dr. Ramesh is present, or staff does not match the photos, or missing institutional classes, refresh to fresh photo state
    const hasOldData = parsed.staff?.some((s: any) => s.name?.includes('Ramesh') || s.name?.includes('Sridevi'));
    const isMissingPhotoStaff = !parsed.staff?.some((s: any) => s.name?.includes('Karuna Sree') || s.code === 'Dr. VK');
    const isMissingInstitutionalClasses = !parsed.classes || parsed.classes.length < 10;
    if (hasOldData || isMissingPhotoStaff || isMissingInstitutionalClasses) {
      console.log("Stale timetable detected. Resetting to official 2026-27 photo timetable...");
      return resetToFreshPhotoData();
    }

    // Ensure nested defaults exist
    if (!parsed.settings) parsed.settings = { ...DEFAULT_SETTINGS };
    if (parsed.settings.cloudDbEnabled === undefined) parsed.settings.cloudDbEnabled = true;
    if (parsed.settings.googleSheetWebAppUrl?.includes('AKfycbx8_TxBONe9Lu_L9TLtz7-ouYFceGA8hfrcAKf1OBZtTDstftr3p_5ll1E3gQF2QjzR')) {
      parsed.settings.googleSheetWebAppUrl = '';
    }
    if (!parsed.config) {
      parsed.config = FRESH_INSTITUTION_CONFIG;
    } else {
      if (parsed.config.attendanceCutoffPercent === undefined) {
        parsed.config.attendanceCutoffPercent = 80;
      }
      if (parsed.config.timeSlots) {
        parsed.config.timeSlots = parsed.config.timeSlots.map((ts: any) => ({
          ...ts,
          start: formatTo12Hour(ts.start),
          end: formatTo12Hour(ts.end)
        }));
      }
    }

    // Ensure roster is wiped of default students and directory starts empty
    if (!parsed.rosterWipedV1) {
      parsed.students = [];
      parsed.sessions = [];
      parsed.studentAttendance = [];
      parsed.rosterWipedV1 = true;
      localStorage.setItem(KEYS.STATE, JSON.stringify(parsed));
    } else {
      if (!parsed.students) parsed.students = [];
      if (!parsed.sessions) parsed.sessions = [];
      if (!parsed.studentAttendance) parsed.studentAttendance = [];
    }

    return parsed;
  } catch (e) {
    return resetToFreshPhotoData();
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(KEYS.STATE, JSON.stringify(state));
  try {
    saveStateToFirestore(state).catch(err => {
      console.warn("Safety Firestore automatic sync failed:", err);
    });
  } catch (e) {
    console.warn("Safety Firestore automatic sync error:", e);
  }
};

export const setSession = (token: string | null, role: 'admin' | 'principal' | null = null) => {
  if (token) {
      localStorage.setItem(KEYS.AUTH, token);
      if (role) localStorage.setItem(KEYS.ROLE, role);
  } else {
      localStorage.removeItem(KEYS.AUTH);
      localStorage.removeItem(KEYS.ROLE);
  }
};

export const getSession = () => localStorage.getItem(KEYS.AUTH);
export const getRole = () => localStorage.getItem(KEYS.ROLE) as 'admin' | 'principal' | null;
export const getSettings = () => getState().settings;
