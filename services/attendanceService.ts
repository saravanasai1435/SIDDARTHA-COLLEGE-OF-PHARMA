import { Student, AttendanceSession, StudentAttendanceEntry, ClassRoom, Subject, TimetableEntry, StaffMember } from '../types';

export interface AttendanceCalculation {
  conducted: number;
  present: number;
  absent: number;
  percentage: number;
}

/**
 * Calculates subject-wise attendance for a student.
 * % = (sessions marked present for that subject) / (sessions conducted for that subject to date) × 100
 */
export const calculateStudentAttendance = (
  studentId: string,
  subjectId: string,
  sessions: AttendanceSession[] = [],
  records: StudentAttendanceEntry[] = []
): AttendanceCalculation => {
  // Find sessions for this subject
  const subjectSessions = sessions.filter(s => s.subjectId === subjectId);
  const sessionIds = new Set(subjectSessions.map(s => s.id));

  // Find marked records for this student in those sessions
  const studentRecords = records.filter(r => r.studentId === studentId && sessionIds.has(r.sessionId));

  const conducted = subjectSessions.length;
  const present = studentRecords.filter(r => r.status === 'present').length;
  const absent = studentRecords.filter(r => r.status === 'absent').length;

  const percentage = conducted === 0 ? 100 : Math.round((present / conducted) * 100);

  return {
    conducted,
    present,
    absent,
    percentage
  };
};

/**
 * Calculates overall attendance for a student across all subjects in their class.
 */
export const calculateStudentOverallAttendance = (
  studentId: string,
  classId: string,
  sessions: AttendanceSession[] = [],
  records: StudentAttendanceEntry[] = []
): AttendanceCalculation => {
  const classSessions = sessions.filter(s => s.classId === classId);
  const sessionIds = new Set(classSessions.map(s => s.id));

  const studentRecords = records.filter(r => r.studentId === studentId && sessionIds.has(r.sessionId));

  const conducted = classSessions.length;
  const present = studentRecords.filter(r => r.status === 'present').length;
  const absent = studentRecords.filter(r => r.status === 'absent').length;

  const percentage = conducted === 0 ? 100 : Math.round((present / conducted) * 100);

  return {
    conducted,
    present,
    absent,
    percentage
  };
};

/**
 * Parses and validates CSV/Excel student roster data.
 * Columns expected: Class, Roll Number, Name, [Admission Number]
 * Match rule: (Class + Roll Number) = unique key for insert/update.
 * Strict validation: Rejects rows with blank roll number or duplicate (Class, Roll Number) in batch.
 */
export interface CSVParseResult {
  validStudents: Student[];
  errors: string[];
  totalRows: number;
}

export const parseStudentCSV = (
  csvContent: string,
  existingClasses: ClassRoom[],
  existingStudents: Student[] = []
): CSVParseResult => {
  const lines = csvContent.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    return {
      validStudents: [],
      errors: ['File contains no student data rows or is missing header row.'],
      totalRows: 0
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const classIdx = headers.findIndex(h => h.includes('class'));
  const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('number') || h.includes('reg'));
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const admIdx = headers.findIndex(h => h.includes('admission') || h.includes('id') || h.includes('adm'));

  if (classIdx === -1 || rollIdx === -1 || nameIdx === -1) {
    return {
      validStudents: [],
      errors: [
        'Invalid header format. Required columns: "Class", "Roll Number", "Name". Optional: "Admission Number".'
      ],
      totalRows: 0
    };
  }

  const validStudents: Student[] = [];
  const errors: string[] = [];
  const seenClassRoll = new Set<string>();

  // Map class lookup by name, id, and section
  const classLookup = new Map<string, ClassRoom>();
  existingClasses.forEach(c => {
    classLookup.set(c.id.toLowerCase(), c);
    classLookup.set(c.name.toLowerCase(), c);
    classLookup.set(`${c.name.toLowerCase()} ${c.section.toLowerCase()}`, c);
    classLookup.set(`${c.name.toLowerCase()}-${c.section.toLowerCase()}`, c);
    classLookup.set(`${c.name.toLowerCase()} (${c.section.toLowerCase()})`, c);
    classLookup.set(`${c.name.toLowerCase()} sec ${c.section.toLowerCase()}`, c);
  });

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const line = lines[i];
    // Split with quote awareness
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));

    const rawClass = cols[classIdx] || '';
    const rawRoll = cols[rollIdx] || '';
    const rawName = cols[nameIdx] || '';
    const rawAdm = admIdx !== -1 ? (cols[admIdx] || '') : '';

    if (!rawRoll.trim()) {
      errors.push(`Row ${rowNum}: Rejected - Blank Roll Number is not permitted.`);
      continue;
    }

    if (!rawName.trim()) {
      errors.push(`Row ${rowNum}: Rejected - Student Name is required.`);
      continue;
    }

    // Resolve class
    const cleanClassStr = rawClass.toLowerCase().trim();
    let targetClass = classLookup.get(cleanClassStr);
    if (!targetClass) {
      // Fuzzy search in classes
      targetClass = existingClasses.find(c =>
        c.id.toLowerCase().includes(cleanClassStr) ||
        cleanClassStr.includes(c.name.toLowerCase()) ||
        cleanClassStr.includes(c.id.toLowerCase())
      );
    }

    if (!targetClass) {
      errors.push(`Row ${rowNum}: Class "${rawClass}" could not be matched to any registered institutional class.`);
      continue;
    }

    const uniqueKey = `${targetClass.id}:::${rawRoll.trim().toUpperCase()}`;
    if (seenClassRoll.has(uniqueKey)) {
      errors.push(`Row ${rowNum}: Rejected duplicate pair - Class [${targetClass.name} ${targetClass.section}] and Roll Number [${rawRoll}] already exists in this file.`);
      continue;
    }
    seenClassRoll.add(uniqueKey);

    // Check if updating existing student or creating new
    const existing = existingStudents.find(s => s.classId === targetClass!.id && s.rollNumber.toUpperCase() === rawRoll.trim().toUpperCase());

    const student: Student = {
      id: existing ? existing.id : `std-${targetClass.id}-${rawRoll.trim().replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36).slice(-4)}`,
      classId: targetClass.id,
      rollNumber: rawRoll.trim(),
      name: rawName.trim(),
      admissionNumber: rawAdm.trim() || (existing?.admissionNumber) || `ADM-${rawRoll.trim()}`
    };

    validStudents.push(student);
  }

  return {
    validStudents,
    errors,
    totalRows: lines.length - 1
  };
};

/**
 * Intelligent Document & PDF Text Roster Parser.
 * Handles text directly extracted or copied from PDF roster sheets, university Gazette lists,
 * tab-separated values, or pipe-separated student registers.
 */
export const parseStudentDocumentOrPDFText = (
  rawText: string,
  targetClassId: string,
  classes: ClassRoom[],
  existingStudents: Student[] = []
): { validStudents: Student[]; errors: string[]; totalLines: number } => {
  const lines = rawText.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
  const validStudents: Student[] = [];
  const errors: string[] = [];
  const seenRoll = new Set<string>();

  let activeClassId = targetClassId;

  // Regex patterns for academic roll numbers (e.g. 24PH0101, 23PD0105, 22PH02A1, 21PH..., 24PD...)
  const rollRegex = /\b([0-9]{2}[A-Za-z]{2,3}[0-9A-Za-z]{3,7}|[0-9]{8,12})\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line represents a Class Header (e.g. "B. Pharm II Year Section A")
    const detectedClass = classes.find(c => {
      const lower = line.toLowerCase();
      const nameLower = c.name.toLowerCase();
      const secLower = c.section ? c.section.toLowerCase() : '';
      return (lower.includes(nameLower) && (!secLower || lower.includes(`sec ${secLower}`) || lower.includes(`section ${secLower}`))) ||
             (lower.includes(c.id.toLowerCase()));
    });
    if (detectedClass) {
      activeClassId = detectedClass.id;
      continue;
    }

    // Skip generic document header lines
    if (
      line.toUpperCase().includes('SIDDHARTHA') ||
      line.toUpperCase().includes('COLLEGE OF PHARMACEUTICAL') ||
      line.toUpperCase().includes('ACADEMIC YEAR') ||
      line.toUpperCase().includes('STUDENT ROSTER') ||
      line.toUpperCase().includes('ATTENDANCE REGISTER') ||
      line.toUpperCase().includes('ROLL NUMBER') && line.toUpperCase().includes('NAME')
    ) {
      continue;
    }

    let roll = '';
    let name = '';
    let adm = '';

    // Check delimited formats first: comma, tab, pipe
    if (line.includes(',') || line.includes('\t') || line.includes('|')) {
      const delimiter = line.includes('\t') ? '\t' : line.includes('|') ? '|' : ',';
      const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, '')).filter(p => p.length > 0);

      // S.No might be parts[0]
      if (parts.length >= 2) {
        if (/^\d+$/.test(parts[0]) && parts.length >= 3) {
          // Format: 1 | 24PH0101 | Name | Adm
          roll = parts[1];
          name = parts[2];
          adm = parts[3] || '';
        } else {
          // Format: 24PH0101 | Name | Adm
          roll = parts[0];
          name = parts[1];
          adm = parts[2] || '';
        }
      }
    } else {
      // Regex extraction from unstructured line: e.g. "1. 24PH0101 Chunduru Saravana Sai"
      const match = line.match(rollRegex);
      if (match) {
        roll = match[1];
        // Clean everything before and including the roll number, what remains is the name
        const rollIndex = line.indexOf(roll);
        let remainder = line.substring(rollIndex + roll.length).trim();
        // Remove leading punctuation like dashes, colons, or pipes
        remainder = remainder.replace(/^[-:|\s]+/, '');
        name = remainder;
      } else {
        // Line might be plain numbered list: "1. Chunduru Saravana Sai"
        const numMatch = line.match(/^\d+[\.\)\-]?\s+(.+)$/);
        if (numMatch) {
          name = numMatch[1].trim();
          roll = `ROLL-${String(validStudents.length + 1).padStart(3, '0')}`;
        }
      }
    }

    // Clean up student name
    name = name.replace(/^\d+[\.\)\-]?\s*/, '').trim();

    if (roll && name && name.length >= 2) {
      const cleanRoll = roll.toUpperCase().trim();
      const currentTargetClass = classes.find(c => c.id === activeClassId) || classes[0];
      const uniqueKey = `${currentTargetClass.id}:::${cleanRoll}`;

      if (seenRoll.has(uniqueKey)) {
        errors.push(`Line ${i + 1}: Duplicate roll number ${cleanRoll} skipped.`);
        continue;
      }
      seenRoll.add(uniqueKey);

      const existing = existingStudents.find(
        s => s.classId === currentTargetClass.id && s.rollNumber.toUpperCase() === cleanRoll
      );

      validStudents.push({
        id: existing ? existing.id : `std-${currentTargetClass.id}-${cleanRoll.replace(/[^a-zA-Z0-9]/g, '')}`,
        classId: currentTargetClass.id,
        rollNumber: cleanRoll,
        name: name,
        admissionNumber: adm || existing?.admissionNumber || `KVSR-${cleanRoll}`
      });
    }
  }

  return {
    validStudents,
    errors,
    totalLines: lines.length
  };
};

/**
 * Generates sample CSV roster template string
 */
export const generateStudentCSVTemplate = (classes: ClassRoom[]): string => {
  const sampleClass = classes[0]?.name ? `${classes[0].name} ${classes[0].section}` : 'B. Pharm I Year A';
  return [
    'Class,Roll Number,Name,Admission Number',
    `"${sampleClass}","24PH0101","A. Sai Sneha","KVSR-2024-001"`,
    `"${sampleClass}","24PH0102","B. Rahul Varma","KVSR-2024-002"`,
    `"${sampleClass}","24PH0103","C. Divya Sri","KVSR-2024-003"`,
    `"${sampleClass}","24PH0104","D. Karthik Kumar","KVSR-2024-004"`
  ].join('\n');
};

/**
 * Seed realistic student rosters for all 12 classes so the feature is immediately usable.
 */
const FIRST_NAMES = [
  'Aaditya', 'Ananya', 'Bhavya', 'Charan', 'Divya', 'Deepak', 'Gowtham', 'Harika',
  'Ishwarya', 'Jaswanth', 'Kavya', 'Kiran', 'Lalitha', 'Manoj', 'Meghana', 'Naveen',
  'Nithya', 'Pooja', 'Praneeth', 'Priyanka', 'Rahul', 'Ramya', 'Rohit', 'Sahithi',
  'Sai Teja', 'Sandhya', 'Sravani', 'Surya', 'Tarun', 'Varun', 'Venkatesh', 'Yamini'
];

const LAST_NAMES = [
  'Adepu', 'Bandi', 'Challa', 'Dupati', 'Eedara', 'Gudipati', 'Inampudi', 'Jampana',
  'Kolluru', 'Lingam', 'Medasani', 'Nanduri', 'Paladugu', 'Ravipati', 'Surapaneni', 'Tadikonda'
];

export const generateDefaultStudents = (classes: ClassRoom[]): Student[] => {
  const students: Student[] = [];

  classes.forEach((cls) => {
    // Generate realistic batch size: 70 for B. Pharm, 35 for Pharm. D
    const count = cls.program === 'Pharm. D' ? 35 : 70;
    const prefix = cls.program === 'Pharm. D' ? '24PD' : '24PH';
    const classNum = cls.id.replace(/[^0-9]/g, '') || '1';

    for (let i = 1; i <= count; i++) {
      const rollStr = `${prefix}${classNum}${cls.section || 'A'}${i.toString().padStart(2, '0')}`;
      const fName = FIRST_NAMES[(i * 3 + cls.name.length) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(i * 2 + cls.section.charCodeAt(0)) % LAST_NAMES.length];

      students.push({
        id: `std-${cls.id}-${i.toString().padStart(2, '0')}`,
        classId: cls.id,
        rollNumber: rollStr,
        name: `${lName} ${fName}`,
        admissionNumber: `KVSR-ADM-${prefix}-${cls.section}-${i.toString().padStart(3, '0')}`
      });
    }
  });

  return students;
};

/**
 * Match a raw roll number string/token entered by faculty/admin against students enrolled in a class.
 * Examples:
 * - "27" matches rollNumber ending with "27", e.g. "24PH1A27" or "27"
 * - "41" matches "24PH1A41"
 * - "24PH0127" matches "24PH0127"
 * - handles numeric matching, suffixes, and padding
 */
export const resolveStudentByRollToken = (rawToken: string, students: Student[]): Student | undefined => {
  const token = rawToken.trim();
  if (!token) return undefined;

  const lowerToken = token.toLowerCase();

  // 1. Direct exact match by rollNumber (case-insensitive)
  const exactRoll = students.find(s => s.rollNumber.trim().toLowerCase() === lowerToken);
  if (exactRoll) return exactRoll;

  // 2. Direct exact match by admissionNumber
  const exactAdm = students.find(s => s.admissionNumber?.trim().toLowerCase() === lowerToken);
  if (exactAdm) return exactAdm;

  // 3. Direct suffix match (e.g. rollNumber '24PH1A27' ends with '27', '027', or '1a27')
  const suffixMatch = students.find(s => {
    const roll = s.rollNumber.trim().toLowerCase();
    return roll.endsWith(lowerToken);
  });
  if (suffixMatch) return suffixMatch;

  // 4. Numeric ending matching:
  // If token is numeric (e.g. "27" or "5"), extract trailing digits of rollNumber
  const tokenNum = parseInt(token, 10);
  if (!isNaN(tokenNum)) {
    const numMatch = students.find(s => {
      const matchDigits = s.rollNumber.match(/\d+$/);
      if (!matchDigits) return false;
      const rollDigits = matchDigits[0];
      const rollNum = parseInt(rollDigits, 10);
      
      // If pure numerical value matches
      if (rollNum === tokenNum) return true;

      // If rollDigits ends with token string, e.g. "0127" ends with "27"
      if (rollDigits.endsWith(token)) return true;

      // Or if token is single digit "5", roll ends with "05"
      if (rollDigits.endsWith(token.padStart(2, '0'))) return true;

      return false;
    });
    if (numMatch) return numMatch;
  }

  return undefined;
};

/**
 * Parses user input string of roll numbers separated by commas, spaces, semicolons, or newlines.
 * Returns unique clean tokens in order of entry.
 */
export const parseRollNumberInput = (input: string): string[] => {
  if (!input) return [];
  const parts = input.split(/[\s,;+\n\r\t]+/).map(p => p.trim()).filter(Boolean);
  return Array.from(new Set(parts));
};

/**
 * Seed initial historical sessions and attendance so percentages are populated and realistic
 */
export const generateSampleSessionsAndAttendance = (
  students: Student[],
  classes: ClassRoom[],
  subjects: Subject[],
  timetable: TimetableEntry[],
  staff: StaffMember[]
): { sessions: AttendanceSession[]; attendance: StudentAttendanceEntry[] } => {
  const sessions: AttendanceSession[] = [];
  const attendance: StudentAttendanceEntry[] = [];

  // Use a fixed set of past dates
  const sampleDates = [
    '2026-09-08',
    '2026-09-09',
    '2026-09-10',
    '2026-09-11',
    '2026-09-12',
    '2026-09-15'
  ];

  // Pick popular classes to seed
  const targetClasses = classes.slice(0, 6);

  targetClasses.forEach(cls => {
    const classStudents = students.filter(s => s.classId === cls.id);
    if (classStudents.length === 0) return;

    // Find timetable entries for this class to pick authentic subjects
    const classEntries = timetable.filter(t => t.classId === cls.id);
    const subjectIds = Array.from(new Set(classEntries.map(t => t.subjectId))).slice(0, 3);

    sampleDates.forEach((date, dateIdx) => {
      subjectIds.forEach((subjId, subjIdx) => {
        const periodNumber = (subjIdx % 6) + 1;
        const sessionId = `ses-${cls.id}-${subjId}-${date}-p${periodNumber}`;

        const entry = classEntries.find(t => t.subjectId === subjId);
        const teacher = staff.find(st => st.id === entry?.facultyId);
        const markedBy = teacher ? teacher.name : 'Dr. Ch. Nagabhushanam';

        sessions.push({
          id: sessionId,
          subjectId: subjId,
          classId: cls.id,
          date,
          periodNumber,
          markedBy,
          markedAt: `${date}T11:00:00.000Z`,
          auditTrail: [
            {
              action: 'created',
              by: markedBy,
              at: `${date} 11:05 AM`,
              reason: 'Initial session marking'
            }
          ]
        });

        // Mark attendance for students with varying rates (some > 80%, 2-3 < 80% to demonstrate threshold)
        classStudents.forEach((st, stIdx) => {
          // Determine presence: student 2 and student 7 have lower attendance (<80%)
          let isPresent = true;
          if (stIdx === 2) {
            // ~66% attendance
            isPresent = dateIdx % 3 !== 0;
          } else if (stIdx === 7) {
            // ~60% attendance
            isPresent = dateIdx % 2 === 0;
          } else if (stIdx === 12) {
            // ~75% attendance
            isPresent = (dateIdx + subjIdx) % 4 !== 0;
          } else {
            // 90-100% attendance
            isPresent = (dateIdx + stIdx) % 8 !== 0;
          }

          attendance.push({
            id: `att-${sessionId}-${st.id}`,
            studentId: st.id,
            sessionId,
            status: isPresent ? 'present' : 'absent',
            markedBy,
            markedAt: `${date}T11:02:00.000Z`
          });
        });
      });
    });
  });

  return { sessions, attendance };
};
