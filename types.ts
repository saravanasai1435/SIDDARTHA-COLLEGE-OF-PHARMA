
export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  isBreak: boolean;
}

export interface InstitutionConfig {
  workingDays: string[];
  periodsPerDay: number;
  timeSlots: TimeSlot[];
  academicYear: string;
  term: string;
  attendanceCutoffPercent?: number; // e.g. 80 (default)
}

export interface TimetableEntry {
  id: string;
  day: string;
  slotId: string;
  subjectId: string;
  facultyId: string;
  classId: string;
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Clinical';
  isLocked?: boolean;
  batch?: string;
  roomOrLab?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  code?: string;
  email: string;
  department: string;
  specialization: string[];
  assignedSubjects: string[]; 
  isActive: boolean;
  availability: string[]; // Days they are available
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  timestamp: string;
  status: 'Present';
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  classId?: string;
  assignedTeacherId?: string;
}

export interface Student {
  id: string;
  classId: string;
  rollNumber: string;
  name: string;
  admissionNumber?: string;
}

export interface AttendanceSessionAudit {
  action: 'created' | 'modified';
  by: string;
  at: string;
  reason?: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  periodNumber: number;
  slotId?: string;
  markedBy: string;
  markedAt: string;
  notes?: string;
  auditTrail?: AttendanceSessionAudit[];
}

export interface StudentAttendanceEntry {
  id: string;
  studentId: string;
  sessionId: string;
  status: 'present' | 'absent';
  markedBy: string;
  markedAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  section: string;
  program?: 'B. Pharm' | 'Pharm. D';
  year?: string;
  semester?: string;
  effectiveDate?: string;
  incharge?: string;
  roomNo?: string;
}

export interface Substitution {
  id: string;
  date: string;
  slotId: string;
  classId: string;
  originalFacultyId: string;
  substituteFacultyId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Cancelled';
}

export interface AdminSettings {
  googleLoginEnabled: boolean;
  approvedEmails: string[];
  googleClientId: string;
  googleClientSecret: string;
  adminUsername: string;
  adminPassword: string;
  principalUsername: string;
  principalPassword: string;
  // Cloud DB Fields
  cloudDbEnabled: boolean;
  googleSheetWebAppUrl: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface AppState {
  config: InstitutionConfig;
  timetable: TimetableEntry[];
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  subjects: Subject[];
  classes: ClassRoom[];
  substitutions: Substitution[];
  settings: AdminSettings;
  logs: SystemLog[];
  students?: Student[];
  sessions?: AttendanceSession[];
  studentAttendance?: StudentAttendanceEntry[];
  rosterWipedV1?: boolean;
}

export interface AnalysisResult {
  summary: string;
  sources: { uri: string; title: string }[];
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}
