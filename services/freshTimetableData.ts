import { AppState, InstitutionConfig, StaffMember, Subject, ClassRoom, TimetableEntry, AdminSettings } from '../types';

export const FRESH_INSTITUTION_CONFIG: InstitutionConfig = {
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  periodsPerDay: 9,
  academicYear: '2026-27',
  term: 'I Year / I Semester (w.e.f. 03.09.2026)',
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

export const FRESH_CLASSES: ClassRoom[] = [
  { id: 'c-bpharm-1a', name: 'B. Pharm I Year', section: 'A' },
  { id: 'c-bpharm-1b', name: 'B. Pharm I Year', section: 'B' }
];

export const FRESH_SUBJECTS: Subject[] = [
  { 
    id: 'sub-python', 
    code: 'PYTHON', 
    name: 'Basics of Python Programming for Pharmaceutical Sciences', 
    department: 'Computer Sciences' 
  },
  { 
    id: 'sub-happ', 
    code: 'HAPP', 
    name: 'Human Anatomy, Physiology & Pathophysiology - I', 
    department: 'Pharmacology' 
  },
  { 
    id: 'sub-gp', 
    code: 'GP', 
    name: 'General Pharmacy', 
    department: 'Pharmaceutics' 
  },
  { 
    id: 'sub-pcog', 
    code: 'P.Cog.', 
    name: 'Introduction to Pharmacognosy', 
    department: 'Pharmacognosy' 
  },
  { 
    id: 'sub-psych', 
    code: 'PSYCH', 
    name: 'Healthcare Psychology & Communication Skills', 
    department: 'Psychology' 
  },
  { 
    id: 'sub-piac', 
    code: 'PIAC', 
    name: 'Pharmaceutical Inorganic & Analytical Chemistry', 
    department: 'Pharmaceutical Chemistry' 
  },
  { 
    id: 'sub-lib', 
    code: 'LIBRARY', 
    name: 'Library & Academic Reading', 
    department: 'Academic Resource' 
  },
  { 
    id: 'sub-sports', 
    code: 'SPORTS', 
    name: 'Sports & Physical Health', 
    department: 'Physical Education' 
  },
  { 
    id: 'sub-act', 
    code: 'ACTIVITY', 
    name: 'Activity / Mentoring Session', 
    department: 'Student Affairs' 
  }
];

export const FRESH_STAFF: StaffMember[] = [
  {
    id: 'staff-vk',
    name: 'Dr. V. Karuna Sree',
    code: 'Dr. VK',
    email: 'karunasree.v@siddartha.edu',
    department: 'Pharmacognosy',
    specialization: ['Introduction to Pharmacognosy (P.Cog.)'],
    assignedSubjects: ['sub-pcog'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-chnb',
    name: 'Dr. Ch. Nagabhushanam',
    code: 'Dr. CHNB',
    email: 'nagabhushanam.ch@siddartha.edu',
    department: 'Pharmacology',
    specialization: ['Human Anatomy, Physiology & Pathophysiology - I (HAPP)', 'Class Incharge'],
    assignedSubjects: ['sub-happ', 'sub-act', 'sub-lib'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-krs',
    name: 'Dr. K. Ravi Shankar',
    code: 'Dr. KRS',
    email: 'ravishankar.k@siddartha.edu',
    department: 'Pharmaceutics',
    specialization: ['General Pharmacy (GP)'],
    assignedSubjects: ['sub-gp'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-skab',
    name: 'Dr. Sk. Arifa Begum',
    code: 'Dr. Sk.AB',
    email: 'arifabegum.sk@siddartha.edu',
    department: 'Pharmaceutics',
    specialization: ['General Pharmacy (GP)'],
    assignedSubjects: ['sub-gp'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-ps',
    name: 'Dr. P. Swetha',
    code: 'Dr. PS',
    email: 'swetha.p@siddartha.edu',
    department: 'Pharmacognosy',
    specialization: ['Introduction to Pharmacognosy (P.Cog.)'],
    assignedSubjects: ['sub-pcog'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-tsm',
    name: 'Ms. T. Sarada Mrinalini',
    code: 'Ms. TSM',
    email: 'saradamrinalini.t@siddartha.edu',
    department: 'Pharmaceutical Chemistry',
    specialization: ['Pharmaceutical Inorganic & Analytical Chemistry (PIAC)'],
    assignedSubjects: ['sub-piac'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-rt',
    name: 'Ms. R. Triveni',
    code: 'Ms. RT',
    email: 'triveni.r@siddartha.edu',
    department: 'Psychology',
    specialization: ['Healthcare Psychology & Communication Skills (Psych Lab)'],
    assignedSubjects: ['sub-psych'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-chp',
    name: 'Ms. Ch. Pallavi',
    code: 'Ms. CH.P',
    email: 'pallavi.ch@siddartha.edu',
    department: 'Pharmaceutical Chemistry',
    specialization: ['Pharmaceutical Inorganic & Analytical Chemistry (PIAC)'],
    assignedSubjects: ['sub-piac'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-gs',
    name: 'Mr. G. Sridhar',
    code: 'Mr. GS',
    email: 'sridhar.g@siddartha.edu',
    department: 'Computer Sciences',
    specialization: ['Basics of Python Programming for Pharmaceutical Sciences'],
    assignedSubjects: ['sub-python'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-bnr',
    name: 'Dr. B. Naga Raju',
    code: 'Dr. BNR',
    email: 'nagaraju.b@siddartha.edu',
    department: 'Pharmacology',
    specialization: ['Human Anatomy, Physiology & Pathophysiology - I (HAPP)', 'Class Incharge'],
    assignedSubjects: ['sub-happ', 'sub-sports'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-gvk',
    name: 'Dr. G. Vijay Kumar',
    code: 'Dr. GVK',
    email: 'vijaykumar.g@siddartha.edu',
    department: 'Psychology',
    specialization: ['Healthcare Psychology & Communication Skills (Psych Lab)'],
    assignedSubjects: ['sub-psych'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'staff-mps',
    name: 'Mr. P. Srinivasu',
    code: 'Mr. PS',
    email: 'srinivasu.p@siddartha.edu',
    department: 'Pharmaceutics',
    specialization: ['General Pharmacy (GP)'],
    assignedSubjects: ['sub-gp'],
    isActive: true,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
];

export const FRESH_TIMETABLE: TimetableEntry[] = [
  // =========================================================================
  // SECTION A: B. Pharm / I Year Section A / I Semester (c-bpharm-1a)
  // =========================================================================

  // MONDAY (Section A)
  { id: 'tt-a-m-1', day: 'Monday', slotId: 'slot-1', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lecture' },
  // Lab Block 10:20 - 12:50 (slots 2, 3, 4)
  { id: 'tt-a-m-2-b1', day: 'Monday', slotId: 'slot-2', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-m-2-b2', day: 'Monday', slotId: 'slot-2', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-m-3-b1', day: 'Monday', slotId: 'slot-3', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-m-3-b2', day: 'Monday', slotId: 'slot-3', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-m-4-b1', day: 'Monday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-m-4-b2', day: 'Monday', slotId: 'slot-4', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  // Afternoon Mon Section A
  { id: 'tt-a-m-5', day: 'Monday', slotId: 'slot-5', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-5-co', day: 'Monday', slotId: 'slot-5', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-6', day: 'Monday', slotId: 'slot-6', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-7', day: 'Monday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-7-co', day: 'Monday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-8', day: 'Monday', slotId: 'slot-8', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-9', day: 'Monday', slotId: 'slot-9', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-m-9-co', day: 'Monday', slotId: 'slot-9', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lecture' },

  // TUESDAY (Section A)
  { id: 'tt-a-tu-1', day: 'Tuesday', slotId: 'slot-1', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lecture' },
  // Lab Block 10:20 - 12:50 (slots 2, 3, 4)
  { id: 'tt-a-tu-2-b1', day: 'Tuesday', slotId: 'slot-2', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-tu-2-b2', day: 'Tuesday', slotId: 'slot-2', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-tu-3-b1', day: 'Tuesday', slotId: 'slot-3', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-tu-3-b2', day: 'Tuesday', slotId: 'slot-3', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-tu-4-b1', day: 'Tuesday', slotId: 'slot-4', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-tu-4-b2', day: 'Tuesday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  // Afternoon Tue Section A
  { id: 'tt-a-tu-5', day: 'Tuesday', slotId: 'slot-5', subjectId: 'sub-act', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Seminar' },
  { id: 'tt-a-tu-6', day: 'Tuesday', slotId: 'slot-6', subjectId: 'sub-psych', facultyId: 'staff-rt', classId: 'c-bpharm-1a', type: 'Lab' },
  { id: 'tt-a-tu-7', day: 'Tuesday', slotId: 'slot-7', subjectId: 'sub-psych', facultyId: 'staff-rt', classId: 'c-bpharm-1a', type: 'Lab' },
  { id: 'tt-a-tu-9', day: 'Tuesday', slotId: 'slot-9', subjectId: 'sub-psych', facultyId: 'staff-rt', classId: 'c-bpharm-1a', type: 'Lecture' },

  // WEDNESDAY (Section A)
  { id: 'tt-a-w-1', day: 'Wednesday', slotId: 'slot-1', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-w-2', day: 'Wednesday', slotId: 'slot-2', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-w-3', day: 'Wednesday', slotId: 'slot-3', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-w-4', day: 'Wednesday', slotId: 'slot-4', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-w-4-co', day: 'Wednesday', slotId: 'slot-4', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lecture' },
  // Afternoon Wed Lab Block 2:00 - 4:30 (slots 5, 6, 7)
  { id: 'tt-a-w-5-b1', day: 'Wednesday', slotId: 'slot-5', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-w-5-b2', day: 'Wednesday', slotId: 'slot-5', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-w-6-b1', day: 'Wednesday', slotId: 'slot-6', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-w-6-b2', day: 'Wednesday', slotId: 'slot-6', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-w-7-b1', day: 'Wednesday', slotId: 'slot-7', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-w-7-b2', day: 'Wednesday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-w-9', day: 'Wednesday', slotId: 'slot-9', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-w-9-co', day: 'Wednesday', slotId: 'slot-9', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lecture' },

  // THURSDAY (Section A)
  { id: 'tt-a-th-1', day: 'Thursday', slotId: 'slot-1', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-th-2', day: 'Thursday', slotId: 'slot-2', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-th-3', day: 'Thursday', slotId: 'slot-3', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-th-4', day: 'Thursday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lecture' },
  // Afternoon Thu Lab Block 2:00 - 4:30 (slots 5, 6, 7)
  { id: 'tt-a-th-5-b1', day: 'Thursday', slotId: 'slot-5', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-th-5-b2', day: 'Thursday', slotId: 'slot-5', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-th-6-b1', day: 'Thursday', slotId: 'slot-6', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-th-6-b2', day: 'Thursday', slotId: 'slot-6', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-th-7-b1', day: 'Thursday', slotId: 'slot-7', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-th-7-b2', day: 'Thursday', slotId: 'slot-7', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-th-9', day: 'Thursday', slotId: 'slot-9', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-th-9-co', day: 'Thursday', slotId: 'slot-9', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lecture' },

  // FRIDAY (Section A)
  { id: 'tt-a-f-1', day: 'Friday', slotId: 'slot-1', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-f-2', day: 'Friday', slotId: 'slot-2', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-f-3', day: 'Friday', slotId: 'slot-3', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-f-4', day: 'Friday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lecture' },
  // Afternoon Fri Lab Block 2:00 - 4:30 (slots 5, 6, 7)
  { id: 'tt-a-f-5-b1', day: 'Friday', slotId: 'slot-5', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-f-5-b2', day: 'Friday', slotId: 'slot-5', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-f-6-b1', day: 'Friday', slotId: 'slot-6', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-f-6-b2', day: 'Friday', slotId: 'slot-6', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-f-7-b1', day: 'Friday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-a-f-7-b2', day: 'Friday', slotId: 'slot-7', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1a', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-a-f-9', day: 'Friday', slotId: 'slot-9', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-f-9-co', day: 'Friday', slotId: 'slot-9', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lecture' },

  // SATURDAY (Section A)
  { id: 'tt-a-sat-1', day: 'Saturday', slotId: 'sat-1', subjectId: 'sub-psych', facultyId: 'staff-rt', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-sat-2', day: 'Saturday', slotId: 'sat-2', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-sat-3', day: 'Saturday', slotId: 'sat-3', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-sat-4', day: 'Saturday', slotId: 'sat-4', subjectId: 'sub-lib', facultyId: 'staff-chnb', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-sat-5', day: 'Saturday', slotId: 'sat-5', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-sat-5-co', day: 'Saturday', slotId: 'sat-5', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1a', type: 'Lecture' },
  { id: 'tt-a-sat-6', day: 'Saturday', slotId: 'sat-6', subjectId: 'sub-sports', facultyId: 'staff-bnr', classId: 'c-bpharm-1a', type: 'Lecture' },

  // =========================================================================
  // SECTION B: B. Pharm / I Year Section B / I Semester (c-bpharm-1b)
  // =========================================================================

  // MONDAY (Section B)
  { id: 'tt-b-m-1', day: 'Monday', slotId: 'slot-1', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-m-2', day: 'Monday', slotId: 'slot-2', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-m-3', day: 'Monday', slotId: 'slot-3', subjectId: 'sub-lib', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-m-4', day: 'Monday', slotId: 'slot-4', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-m-4-co', day: 'Monday', slotId: 'slot-4', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1b', type: 'Lecture' },
  // Afternoon Mon Lab Block 2:00 - 4:30 (slots 5, 6, 7)
  { id: 'tt-b-m-5-b1', day: 'Monday', slotId: 'slot-5', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-m-5-b2', day: 'Monday', slotId: 'slot-5', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-m-6-b1', day: 'Monday', slotId: 'slot-6', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-m-6-b2', day: 'Monday', slotId: 'slot-6', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-m-7-b1', day: 'Monday', slotId: 'slot-7', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-m-7-b2', day: 'Monday', slotId: 'slot-7', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-m-9', day: 'Monday', slotId: 'slot-9', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lecture' },

  // TUESDAY (Section B)
  { id: 'tt-b-tu-1', day: 'Tuesday', slotId: 'slot-1', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-tu-2', day: 'Tuesday', slotId: 'slot-2', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-tu-3', day: 'Tuesday', slotId: 'slot-3', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-tu-4', day: 'Tuesday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lecture' },
  // Afternoon Tue Lab Block 2:00 - 4:30 (slots 5, 6, 7)
  { id: 'tt-b-tu-5-b1', day: 'Tuesday', slotId: 'slot-5', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-tu-5-b2', day: 'Tuesday', slotId: 'slot-5', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-tu-6-b1', day: 'Tuesday', slotId: 'slot-6', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-tu-6-b2', day: 'Tuesday', slotId: 'slot-6', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-tu-7-b1', day: 'Tuesday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-tu-7-b2', day: 'Tuesday', slotId: 'slot-7', subjectId: 'sub-python', facultyId: 'staff-gs', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-tu-9', day: 'Tuesday', slotId: 'slot-9', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-tu-9-co', day: 'Tuesday', slotId: 'slot-9', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lecture' },

  // WEDNESDAY (Section B)
  { id: 'tt-b-w-1', day: 'Wednesday', slotId: 'slot-1', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1b', type: 'Lecture' },
  // Lab Block 10:20 - 12:50 (slots 2, 3, 4)
  { id: 'tt-b-w-2-b1', day: 'Wednesday', slotId: 'slot-2', subjectId: 'sub-gp', facultyId: 'staff-mps', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-w-2-b2', day: 'Wednesday', slotId: 'slot-2', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-w-3-b1', day: 'Wednesday', slotId: 'slot-3', subjectId: 'sub-gp', facultyId: 'staff-mps', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-w-3-b2', day: 'Wednesday', slotId: 'slot-3', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-w-4-b1', day: 'Wednesday', slotId: 'slot-4', subjectId: 'sub-gp', facultyId: 'staff-mps', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-w-4-b2', day: 'Wednesday', slotId: 'slot-4', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  // Afternoon Wed Section B
  { id: 'tt-b-w-5', day: 'Wednesday', slotId: 'slot-5', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-6', day: 'Wednesday', slotId: 'slot-6', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-7', day: 'Wednesday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-7-co', day: 'Wednesday', slotId: 'slot-7', subjectId: 'sub-pcog', facultyId: 'staff-ps', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-8', day: 'Wednesday', slotId: 'slot-8', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-8-co', day: 'Wednesday', slotId: 'slot-8', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-9', day: 'Wednesday', slotId: 'slot-9', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-w-9-co', day: 'Wednesday', slotId: 'slot-9', subjectId: 'sub-gp', facultyId: 'staff-skab', classId: 'c-bpharm-1b', type: 'Lecture' },

  // THURSDAY (Section B)
  { id: 'tt-b-th-1', day: 'Thursday', slotId: 'slot-1', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lecture' },
  // Lab Block 10:20 - 12:50 (slots 2, 3, 4)
  { id: 'tt-b-th-2-b1', day: 'Thursday', slotId: 'slot-2', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-th-2-b2', day: 'Thursday', slotId: 'slot-2', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-th-3-b1', day: 'Thursday', slotId: 'slot-3', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-th-3-b2', day: 'Thursday', slotId: 'slot-3', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-th-4-b1', day: 'Thursday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-th-4-b2', day: 'Thursday', slotId: 'slot-4', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  // Afternoon Thu Section B
  { id: 'tt-b-th-5', day: 'Thursday', slotId: 'slot-5', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-th-6', day: 'Thursday', slotId: 'slot-6', subjectId: 'sub-pcog', facultyId: 'staff-vk', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-th-7', day: 'Thursday', slotId: 'slot-7', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-th-7-co', day: 'Thursday', slotId: 'slot-7', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-th-8', day: 'Thursday', slotId: 'slot-8', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-th-8-co', day: 'Thursday', slotId: 'slot-8', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-th-9', day: 'Thursday', slotId: 'slot-9', subjectId: 'sub-sports', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lecture' },

  // FRIDAY (Section B)
  { id: 'tt-b-f-1', day: 'Friday', slotId: 'slot-1', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lecture' },
  // Lab Block 10:20 - 12:50 (slots 2, 3, 4)
  { id: 'tt-b-f-2-b1', day: 'Friday', slotId: 'slot-2', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-f-2-b2', day: 'Friday', slotId: 'slot-2', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-f-3-b1', day: 'Friday', slotId: 'slot-3', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-f-3-b2', day: 'Friday', slotId: 'slot-3', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  { id: 'tt-b-f-4-b1', day: 'Friday', slotId: 'slot-4', subjectId: 'sub-piac', facultyId: 'staff-chp', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch I' },
  { id: 'tt-b-f-4-b2', day: 'Friday', slotId: 'slot-4', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lab', batch: 'Batch II' },
  // Afternoon Fri Section B
  { id: 'tt-b-f-5', day: 'Friday', slotId: 'slot-5', subjectId: 'sub-act', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Seminar' },
  { id: 'tt-b-f-6', day: 'Friday', slotId: 'slot-6', subjectId: 'sub-psych', facultyId: 'staff-gvk', classId: 'c-bpharm-1b', type: 'Lab' },
  { id: 'tt-b-f-7', day: 'Friday', slotId: 'slot-7', subjectId: 'sub-psych', facultyId: 'staff-gvk', classId: 'c-bpharm-1b', type: 'Lab' },
  { id: 'tt-b-f-9', day: 'Friday', slotId: 'slot-9', subjectId: 'sub-psych', facultyId: 'staff-gvk', classId: 'c-bpharm-1b', type: 'Lecture' },

  // SATURDAY (Section B)
  { id: 'tt-b-sat-1', day: 'Saturday', slotId: 'sat-1', subjectId: 'sub-psych', facultyId: 'staff-gvk', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-sat-2', day: 'Saturday', slotId: 'sat-2', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-sat-3', day: 'Saturday', slotId: 'sat-3', subjectId: 'sub-gp', facultyId: 'staff-krs', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-sat-4', day: 'Saturday', slotId: 'sat-4', subjectId: 'sub-piac', facultyId: 'staff-tsm', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-sat-5', day: 'Saturday', slotId: 'sat-5', subjectId: 'sub-happ', facultyId: 'staff-chnb', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-sat-5-co', day: 'Saturday', slotId: 'sat-5', subjectId: 'sub-happ', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lecture' },
  { id: 'tt-b-sat-6', day: 'Saturday', slotId: 'sat-6', subjectId: 'sub-sports', facultyId: 'staff-bnr', classId: 'c-bpharm-1b', type: 'Lecture' }
];

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
        action: 'Official 2026-27 w.e.f. 03.09.2026 Timetable synchronized for B.Pharm Sec A & B'
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
