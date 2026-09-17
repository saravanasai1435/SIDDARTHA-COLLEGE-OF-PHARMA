import React, { useState, useMemo, useEffect } from 'react';
import { AppState, ClassRoom, Subject, Student, AttendanceSession, StudentAttendanceEntry, StaffMember } from '../../../types';
import { 
  calculateStudentAttendance, 
  calculateStudentOverallAttendance,
  resolveStudentByRollToken,
  parseRollNumberInput
} from '../../../services/attendanceService';

interface AttendanceMarkerProps {
  appState: AppState;
  userRole: 'admin' | 'principal' | null;
  selectedTeacherId?: string;
  onSaveSession: (session: AttendanceSession, entries: StudentAttendanceEntry[]) => void;
  triggerAlert: (title: string, message: string) => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

export const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  appState,
  userRole,
  selectedTeacherId,
  onSaveSession,
  triggerAlert,
  triggerConfirm
}) => {
  const cutoff = appState.config.attendanceCutoffPercent ?? 80;
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter classes based on role / teacher assignment
  const assignedClasses = useMemo(() => {
    if (userRole === 'principal' || !selectedTeacherId) {
      return appState.classes;
    }
    // Find classes assigned to this teacher in timetable or subjects
    const teacherEntries = appState.timetable.filter(t => t.facultyId === selectedTeacherId);
    const classIds = new Set(teacherEntries.map(t => t.classId));
    const matched = appState.classes.filter(c => classIds.has(c.id));
    return matched.length > 0 ? matched : appState.classes;
  }, [appState.classes, appState.timetable, userRole, selectedTeacherId]);

  // Selected state
  const [selectedClassId, setSelectedClassId] = useState<string>(assignedClasses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(todayStr);
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [editReason, setEditReason] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Student toggle state: map of studentId -> 'present' | 'absent'
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent'>>({});

  // Quick Absent Reporting by Roll Numbers State
  const [absentRollsInput, setAbsentRollsInput] = useState<string>('');
  const [autoApplyRolls, setAutoApplyRolls] = useState<boolean>(true);
  const [rollNotice, setRollNotice] = useState<{ type: 'success' | 'warn' | 'info'; text: string } | null>(null);

  // Keep selectedClassId valid
  useEffect(() => {
    if (!assignedClasses.some(c => c.id === selectedClassId) && assignedClasses.length > 0) {
      setSelectedClassId(assignedClasses[0].id);
    }
  }, [assignedClasses, selectedClassId]);

  // Available subjects for the selected class
  const classSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    // From timetable entries for this class
    const timetableSubjects = appState.timetable
      .filter(t => t.classId === selectedClassId)
      .map(t => t.subjectId);
    const subjectIdSet = new Set(timetableSubjects);

    // If teacher mode, identify which ones this teacher specifically teaches
    return appState.subjects.filter(s => subjectIdSet.has(s.id) || s.classId === selectedClassId);
  }, [selectedClassId, appState.timetable, appState.subjects]);

  // Set default subject when class changes
  useEffect(() => {
    if (classSubjects.length > 0) {
      // If teacher is selected, prefer a subject they teach
      if (selectedTeacherId && userRole !== 'principal') {
        const teacherSubject = classSubjects.find(s => {
          return appState.timetable.some(t => t.classId === selectedClassId && t.subjectId === s.id && t.facultyId === selectedTeacherId);
        });
        if (teacherSubject) {
          setSelectedSubjectId(teacherSubject.id);
          return;
        }
      }
      if (!classSubjects.some(s => s.id === selectedSubjectId)) {
        setSelectedSubjectId(classSubjects[0].id);
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [selectedClassId, classSubjects, selectedTeacherId, userRole, appState.timetable]);

  // Students in selected class
  const studentsInClass = useMemo(() => {
    const list = (appState.students || []).filter(s => s.classId === selectedClassId);
    // Sort by roll number ascending
    return list.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));
  }, [appState.students, selectedClassId]);

  // Check if session already exists for (class, subject, date, periodNumber)
  const existingSession = useMemo(() => {
    if (!selectedClassId || !selectedSubjectId || !sessionDate) return null;
    return (appState.sessions || []).find(
      s => s.classId === selectedClassId &&
           s.subjectId === selectedSubjectId &&
           s.date === sessionDate &&
           s.periodNumber === periodNumber
    ) || null;
  }, [appState.sessions, selectedClassId, selectedSubjectId, sessionDate, periodNumber]);

  // Load status map whenever class, subject, date, period, or existingSession changes
  useEffect(() => {
    const initialMap: Record<string, 'present' | 'absent'> = {};
    if (existingSession) {
      // Load previously recorded status
      const records = (appState.studentAttendance || []).filter(r => r.sessionId === existingSession.id);
      studentsInClass.forEach(st => {
        const rec = records.find(r => r.studentId === st.id);
        initialMap[st.id] = rec ? rec.status : 'present';
      });
    } else {
      // Default to 'present' for all students
      studentsInClass.forEach(st => {
        initialMap[st.id] = 'present';
      });
    }
    setStatusMap(initialMap);
  }, [existingSession, studentsInClass, appState.studentAttendance]);

  // Bulk actions
  const markAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    studentsInClass.forEach(st => {
      updated[st.id] = status;
    });
    setStatusMap(updated);
  };

  const toggleStudent = (studentId: string) => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  // Parse and match entered roll numbers against students in the selected class
  const rollAnalysis = useMemo(() => {
    const tokens = parseRollNumberInput(absentRollsInput);
    const matchedStudents: Student[] = [];
    const matchedStudentIds = new Set<string>();
    const unmatchedTokens: string[] = [];

    tokens.forEach(tok => {
      const student = resolveStudentByRollToken(tok, studentsInClass);
      if (student) {
        if (!matchedStudentIds.has(student.id)) {
          matchedStudentIds.add(student.id);
          matchedStudents.push(student);
        }
      } else {
        unmatchedTokens.push(tok);
      }
    });

    return {
      tokens,
      matchedStudents,
      matchedStudentIds,
      unmatchedTokens
    };
  }, [absentRollsInput, studentsInClass]);

  // When auto-apply is enabled, automatically mark entered roll numbers as absent in statusMap
  useEffect(() => {
    if (!autoApplyRolls) return;
    if (rollAnalysis.tokens.length === 0) return;

    if (rollAnalysis.matchedStudentIds.size > 0) {
      setStatusMap(prev => {
        let changed = false;
        const next = { ...prev };
        rollAnalysis.matchedStudentIds.forEach(id => {
          if (next[id] !== 'absent') {
            next[id] = 'absent';
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [absentRollsInput, autoApplyRolls, rollAnalysis]);

  // Action: Mark entered roll numbers absent
  const handleMarkEnteredAbsent = (resetOthersToPresent = false) => {
    if (rollAnalysis.tokens.length === 0) {
      triggerAlert(
        'Empty Roll Numbers',
        'Please enter one or more roll numbers (e.g. 27, 41, 51, 67, 45, 89, 35) to report them absent.'
      );
      return;
    }

    setStatusMap(prev => {
      const next: Record<string, 'present' | 'absent'> = {};
      studentsInClass.forEach(st => {
        if (resetOthersToPresent) {
          next[st.id] = rollAnalysis.matchedStudentIds.has(st.id) ? 'absent' : 'present';
        } else {
          if (rollAnalysis.matchedStudentIds.has(st.id)) {
            next[st.id] = 'absent';
          } else {
            next[st.id] = prev[st.id] || 'present';
          }
        }
      });
      return next;
    });

    let msg = `Reported ${rollAnalysis.matchedStudents.length} student${rollAnalysis.matchedStudents.length === 1 ? '' : 's'} as absent.`;
    if (rollAnalysis.unmatchedTokens.length > 0) {
      msg += ` Notice: ${rollAnalysis.unmatchedTokens.length} roll number(s) [${rollAnalysis.unmatchedTokens.join(', ')}] not found in ${selectedClassObj?.name || 'this class'}.`;
    }
    setRollNotice({
      type: rollAnalysis.unmatchedTokens.length > 0 ? 'warn' : 'success',
      text: msg
    });
  };

  // Action: Remove specific token from the input
  const handleRemoveToken = (tokenToRemove: string, studentIdToPresent?: string) => {
    const updated = rollAnalysis.tokens.filter(t => t.toLowerCase() !== tokenToRemove.toLowerCase());
    setAbsentRollsInput(updated.join(', '));
    if (studentIdToPresent) {
      setStatusMap(prev => ({
        ...prev,
        [studentIdToPresent]: 'present'
      }));
    }
  };

  // Action: Clear roll input
  const handleClearRollInput = () => {
    setAbsentRollsInput('');
    setRollNotice(null);
  };

  // Action: Quick fill example
  const handleFillExample = () => {
    setAbsentRollsInput('27, 41, 51, 67, 45, 89, 35');
    setRollNotice({
      type: 'info',
      text: 'Example roll numbers loaded (27, 41, 51, 67, 45, 89, 35). Entered students are automatically reported as absent.'
    });
  };

  // Stats for the active roster
  const presentCount = Object.values(statusMap).filter(v => v === 'present').length;
  const absentCount = Object.values(statusMap).filter(v => v === 'absent').length;
  const totalCount = studentsInClass.length;
  const sessionRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Handler to submit attendance
  const handleSubmit = (reasonText?: string) => {
    if (!selectedClassId) {
      triggerAlert('Validation Error', 'Please select an academic class.');
      return;
    }
    if (!selectedSubjectId) {
      triggerAlert('Validation Error', 'Please select an academic subject.');
      return;
    }
    if (studentsInClass.length === 0) {
      triggerAlert('No Students', 'There are no students enrolled in this class yet. Please import or add students first.');
      return;
    }

    // Determine current user marker name
    let markerName = 'Admin';
    if (userRole === 'principal') {
      markerName = 'Principal (Dr. A. Suneetha)';
    } else if (selectedTeacherId) {
      const teacher = appState.staff.find(s => s.id === selectedTeacherId);
      if (teacher) markerName = teacher.name;
    }

    const sessionId = existingSession ? existingSession.id : `ses-${selectedClassId}-${selectedSubjectId}-${sessionDate}-p${periodNumber}`;
    const timestamp = new Date().toISOString();

    const auditEntry = {
      action: existingSession ? ('modified' as const) : ('created' as const),
      by: markerName,
      at: new Date().toLocaleString(),
      reason: reasonText || (existingSession ? 'Attendance amended' : 'Initial session submission')
    };

    let sessionNotes = reasonText || existingSession?.notes;
    if (!sessionNotes && rollAnalysis.matchedStudents.length > 0) {
      sessionNotes = `Absentees reported by roll numbers: ${rollAnalysis.matchedStudents.map(s => s.rollNumber).join(', ')} (${rollAnalysis.matchedStudents.length} absent)`;
    }

    const sessionObj: AttendanceSession = {
      id: sessionId,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      date: sessionDate,
      periodNumber: periodNumber,
      markedBy: existingSession ? existingSession.markedBy : markerName,
      markedAt: existingSession ? existingSession.markedAt : timestamp,
      notes: sessionNotes,
      auditTrail: [
        ...(existingSession?.auditTrail || []),
        auditEntry
      ]
    };

    // Generate entries per student
    const entries: StudentAttendanceEntry[] = studentsInClass.map(st => ({
      id: `att-${sessionId}-${st.id}`,
      studentId: st.id,
      sessionId: sessionId,
      status: statusMap[st.id] || 'present',
      markedBy: markerName,
      markedAt: timestamp
    }));

    onSaveSession(sessionObj, entries);
    setIsEditModalOpen(false);
    setEditReason('');
  };

  const handleInitiateSubmit = () => {
    if (existingSession) {
      // Session already exists - open audit modal for edit reason
      setIsEditModalOpen(true);
    } else {
      triggerConfirm(
        'Submit Attendance',
        `Commit attendance for ${studentsInClass.length} students?\n\nPresent: ${presentCount} | Absent: ${absentCount} (${sessionRate}%)`,
        () => handleSubmit()
      );
    }
  };

  // Helper to get time label for period
  const periodLabel = useMemo(() => {
    const slot = appState.config.timeSlots.find(s => s.id === `slot-${periodNumber}`);
    return slot ? `${slot.label} (${slot.start} - ${slot.end})` : `Period ${periodNumber}`;
  }, [appState.config.timeSlots, periodNumber]);

  const selectedClassObj = appState.classes.find(c => c.id === selectedClassId);
  const selectedSubjectObj = appState.subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in fill-mode-both">
      {/* Configuration & Selection Ribbon */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] border border-emerald-100 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
                Attendance Marking Terminal
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">
              {userRole === 'principal' 
                ? 'Executive authority (Principal Dr. A. Suneetha): Unrestricted access across all classes, sections, and subjects' 
                : 'Faculty access: Record and synchronize lecture & practical attendance'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start md:self-auto">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl">
              Cutoff: <strong className="text-emerald-800">{cutoff}%</strong>
            </span>
            {existingSession && (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left"></i> Session Recorded
              </span>
            )}
          </div>
        </div>

        {/* Form Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5 sm:mb-2">
              1. Academic Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {assignedClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(Sec ${c.section})` : ''} - {c.program}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5 sm:mb-2">
              2. Academic Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classSubjects.length === 0 ? (
                <option value="">No registered subjects</option>
              ) : (
                classSubjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5 sm:mb-2">
              3. Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Period Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5 sm:mb-2">
              4. Period / Session
            </label>
            <select
              value={periodNumber}
              onChange={e => setPeriodNumber(Number(e.target.value))}
              className="w-full p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => {
                const slot = appState.config.timeSlots.find(s => s.id === `slot-${p}`);
                const timing = slot ? `(${slot.start} - ${slot.end})` : '';
                return (
                  <option key={p} value={p}>
                    Period {p} {timing}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Existing Session Alert / Audit Banner */}
        {existingSession && (
          <div className="p-3.5 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                <i className="fa-solid fa-triangle-exclamation text-xs sm:text-sm"></i>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-amber-950">
                  Existing Session Record Detected
                </h4>
                <p className="text-[11px] sm:text-xs font-semibold text-amber-800 mt-0.5">
                  Originally marked by <strong className="font-black">{existingSession.markedBy}</strong> on {new Date(existingSession.markedAt).toLocaleString()}.
                  {existingSession.auditTrail && existingSession.auditTrail.length > 1 && (
                    <span className="ml-1 text-[10px] sm:text-[11px] font-bold text-amber-700">
                      ({existingSession.auditTrail.length - 1} prior revision{existingSession.auditTrail.length > 2 ? 's' : ''})
                    </span>
                  )}
                </p>
                {existingSession.notes && (
                  <p className="text-[10px] sm:text-[11px] italic text-amber-900 mt-1">
                    "{existingSession.notes}"
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-amber-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-900 active:scale-95 transition-all shrink-0 text-center"
            >
              <i className="fa-solid fa-pen-to-square mr-1.5"></i> Rectify With Audit Note
            </button>
          </div>
        )}
      </div>

      {/* Roster Controls & Metrics Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
              Class Roster
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-950">
                {totalCount}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                Students
              </span>
            </div>
          </div>

          <div className="h-8 sm:h-10 w-px bg-slate-200 hidden sm:block"></div>

          {/* Present / Absent counts */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                Present
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-900">
                {presentCount}
              </span>
            </div>

            <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                Absent
              </span>
              <span className="text-base sm:text-lg font-black text-rose-900">
                {absentCount}
              </span>
            </div>

            <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Batch Rate
              </span>
              <span className="text-base sm:text-lg font-black text-slate-800">
                {sessionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Marking Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => markAll('present')}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-900 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-check-double text-emerald-700"></i> All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('absent')}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-xmark text-slate-500"></i> All Absent
          </button>

          <button
            type="button"
            onClick={handleInitiateSubmit}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            {existingSession ? 'Update Session' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      {/* Quick Roll Number Absentee Reporting Station */}
      {studentsInClass.length > 0 && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 border-rose-100 shadow-sm space-y-4 sm:space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start md:items-center gap-3 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-md shadow-rose-200">
                <i className="fa-solid fa-user-xmark"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-rose-950 uppercase tracking-tight">
                    Auto-Report Absent Students by Roll Numbers
                  </h4>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Fast Roll Call
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Enter roll numbers (e.g. <strong className="text-rose-900 font-mono">27, 41, 51, 67, 45, 89, 35...</strong>) separated by commas or spaces. Matching students are automatically reported absent.
                </p>
              </div>
            </div>

            {/* Example Preset Button */}
            <button
              type="button"
              onClick={handleFillExample}
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shrink-0 self-start md:self-auto"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-rose-500"></i>
              Load Example (27, 41, 51, 67, 45, 89, 35)
            </button>
          </div>

          {/* Input & Action Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-rose-400">
                  <i className="fa-solid fa-barcode text-sm"></i>
                </div>
                <input
                  type="text"
                  value={absentRollsInput}
                  onChange={e => {
                    setAbsentRollsInput(e.target.value);
                    if (rollNotice) setRollNotice(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleMarkEnteredAbsent(false);
                    }
                  }}
                  placeholder="e.g. 27, 41, 51, 67, 45..."
                  className="w-full h-11 sm:h-12 pl-10 sm:pl-11 pr-20 sm:pr-28 bg-slate-50 border border-rose-200 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl sm:rounded-2xl text-xs font-mono font-bold text-rose-950 placeholder:text-slate-400 shadow-inner transition-all"
                />
                {absentRollsInput && (
                  <button
                    type="button"
                    onClick={handleClearRollInput}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkEnteredAbsent(false)}
                  className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
                >
                  <i className="fa-solid fa-user-minus"></i>
                  Mark Absent
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkEnteredAbsent(true)}
                  className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
                  title="Marks entered roll numbers as Absent and marks all other enrolled students as Present"
                >
                  <i className="fa-solid fa-users-viewfinder"></i>
                  <span className="hidden sm:inline">All Present Except Entered</span>
                  <span className="inline sm:hidden">Except Entered</span>
                </button>
              </div>
            </div>

            {/* Auto-apply toggle checkbox & helper note */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-semibold text-[11px] sm:text-xs">
                <input
                  type="checkbox"
                  checked={autoApplyRolls}
                  onChange={e => setAutoApplyRolls(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span>Auto-report absent while typing</span>
              </label>

              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
                Supports suffix digits (e.g. "27") or full tokens
              </span>
            </div>
          </div>

          {/* Roll Analysis & Badges Summary */}
          {rollAnalysis.tokens.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                    Parsed Roll Numbers ({rollAnalysis.tokens.length}):
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-mono font-bold text-[10px]">
                    {rollAnalysis.matchedStudents.length} Matched in Class
                  </span>
                  {rollAnalysis.unmatchedTokens.length > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-mono font-bold text-[10px]">
                      {rollAnalysis.unmatchedTokens.length} Not Found
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleClearRollInput}
                  className="text-[10px] font-black uppercase tracking-wider text-rose-700 hover:underline"
                >
                  Reset List
                </button>
              </div>

              {/* Matched Student Badges */}
              {rollAnalysis.matchedStudents.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1.5">
                    Reported Absent ({rollAnalysis.matchedStudents.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {rollAnalysis.matchedStudents.map(st => (
                      <span
                        key={st.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-950 text-xs font-bold shadow-2xs"
                      >
                        <span className="font-mono text-rose-600 font-black">
                          {st.rollNumber}
                        </span>
                        <span className="text-slate-700 truncate max-w-[120px]">
                          {st.name}
                        </span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                          Absent
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const tok = rollAnalysis.tokens.find(t => {
                              const s = resolveStudentByRollToken(t, [st]);
                              return s !== null;
                            });
                            if (tok) handleRemoveToken(tok, st.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 ml-0.5"
                          title="Remove and mark Present"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unmatched Tokens Warning */}
              {rollAnalysis.unmatchedTokens.length > 0 && (
                <div className="pt-2 border-t border-rose-200/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
                    Roll Numbers Not Found in Current Class ({selectedClassObj?.name || 'Class'}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {rollAnalysis.unmatchedTokens.map(tok => (
                      <span
                        key={tok}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-mono font-bold"
                      >
                        <span>Roll: {tok}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveToken(tok)}
                          className="text-amber-700 hover:text-amber-950 ml-1"
                          title="Dismiss roll token"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback notice if any */}
          {rollNotice && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
              rollNotice.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                : rollNotice.type === 'warn'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}>
              <i className={`fa-solid ${
                rollNotice.type === 'success' ? 'fa-circle-check text-emerald-600' :
                rollNotice.type === 'warn' ? 'fa-triangle-exclamation text-amber-600' :
                'fa-circle-info text-blue-600'
              }`}></i>
              <span>{rollNotice.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Roster Table */}
      {studentsInClass.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto text-xl sm:text-2xl">
            <i className="fa-solid fa-users-slash"></i>
          </div>
          <h4 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wide">
            No Students Registered In This Class
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please use the <strong>Class Roster & Import</strong> tab to upload the student list via Excel/CSV or seed sample rosters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <div className="text-[11px] sm:text-xs font-bold text-slate-600">
              Showing <span className="font-black text-emerald-950">{studentsInClass.length}</span> students for <span className="font-black text-emerald-900">{selectedClassObj?.name} ({selectedClassObj?.section})</span> &bull; Subject: <span className="font-black text-emerald-900">{selectedSubjectObj?.name} ({selectedSubjectObj?.code})</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-400"></span>
              Highlighted rows have attendance &lt; {cutoff}%
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {studentsInClass.map((student, idx) => {
              const isPresent = statusMap[student.id] === 'present';
              const subjectMetrics = calculateStudentAttendance(
                student.id,
                selectedSubjectId,
                appState.sessions || [],
                appState.studentAttendance || []
              );
              const overallMetrics = calculateStudentOverallAttendance(
                student.id,
                selectedClassId,
                appState.sessions || [],
                appState.studentAttendance || []
              );
              const isBelowCutoff = subjectMetrics.percentage < cutoff;
              const isMatchedRollAbsent = rollAnalysis.matchedStudentIds.has(student.id);

              return (
                <div
                  key={student.id}
                  className={`p-3.5 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                    isMatchedRollAbsent
                      ? 'bg-rose-50/80 hover:bg-rose-100/60 border-l-4 border-l-rose-600'
                      : isBelowCutoff 
                      ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500' 
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Left: Roll No, Name, Admission No */}
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-4">
                    <span className="text-[11px] sm:text-xs font-black text-slate-400 w-5 sm:w-6 text-right shrink-0 mt-1 sm:mt-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs font-black shrink-0 border ${
                      isMatchedRollAbsent 
                        ? 'bg-rose-100 border-rose-300 text-rose-950' 
                        : 'bg-slate-100 border-slate-200 text-emerald-950'
                    }`}>
                      {student.rollNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-emerald-950">
                          {student.name}
                        </span>
                        {isMatchedRollAbsent && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-rose-600 text-white rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                            <i className="fa-solid fa-user-xmark text-[8px]"></i> Absent
                          </span>
                        )}
                        {isBelowCutoff && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                            &lt; {cutoff}%
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                        {student.admissionNumber && (
                          <span>ID: <strong className="text-slate-600 font-semibold">{student.admissionNumber}</strong></span>
                        )}
                        <span className="hidden xs:inline">&bull;</span>
                        <span>Overall: <strong className="text-slate-600">{overallMetrics.percentage}%</strong> ({overallMetrics.present}/{overallMetrics.conducted})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Subject Attendance % Badge + Toggle Switch */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Subject Attendance Badge */}
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-1 sm:gap-1.5 justify-start sm:justify-end">
                        <span className={`text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border ${
                          isBelowCutoff 
                            ? 'bg-rose-100 text-rose-800 border-rose-200' 
                            : 'bg-emerald-100/70 text-emerald-900 border-emerald-200'
                        }`}>
                          {subjectMetrics.percentage}%
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block mt-0.5">
                        {subjectMetrics.present}/{subjectMetrics.conducted} classes
                      </span>
                    </div>

                    {/* Present / Absent Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleStudent(student.id)}
                      className={`min-w-[95px] sm:min-w-[110px] h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm active:scale-95 touch-manipulation ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                          : 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
                      }`}
                    >
                      <i className={`fa-solid ${isPresent ? 'fa-check' : 'fa-xmark'}`}></i>
                      {isPresent ? 'Present' : 'Absent'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating or bottom save reminder */}
      {studentsInClass.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleInitiateSubmit}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            {existingSession ? 'Update Session Attendance' : 'Commit & Submit Attendance'}
          </button>
        </div>
      )}

      {/* Audit Reason Modal for modifying an existing session */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-emerald-100 p-5 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg sm:text-xl shrink-0">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 uppercase tracking-tight">
                  Session Modification Audit
                </h3>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">
                  This session was previously locked. Institutional policy requires an audit rationale for attendance rectification.
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900">
                Audit Justification / Note
              </label>
              <textarea
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="e.g., Medical certificate verified by Principal; Student entered late due to lab assignment..."
                rows={3}
                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-[10px] sm:text-[11px] font-semibold text-slate-600 space-y-0.5">
              <p><strong>Class:</strong> {selectedClassObj?.name} ({selectedClassObj?.section})</p>
              <p><strong>Subject:</strong> {selectedSubjectObj?.name} ({selectedSubjectObj?.code})</p>
              <p><strong>Session:</strong> {sessionDate} &bull; {periodLabel}</p>
              <p><strong>Current Batch Marks:</strong> {presentCount} Present &bull; {absentCount} Absent</p>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(editReason.trim() || 'Session attendance amended')}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all"
              >
                Confirm & Log Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
