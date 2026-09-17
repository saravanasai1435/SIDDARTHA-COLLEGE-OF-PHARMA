import React, { useState, useMemo } from 'react';
import { AppState, ClassRoom, Student, Subject, AttendanceSession } from '../../types';
import { calculateStudentAttendance, calculateStudentOverallAttendance } from '../../services/attendanceService';

interface StudentClassAttendanceViewProps {
  appState: AppState;
  initialClassId?: string;
  onBackToSchedule?: () => void;
}

export const StudentClassAttendanceView: React.FC<StudentClassAttendanceViewProps> = ({
  appState,
  initialClassId,
  onBackToSchedule
}) => {
  // Default to first class or provided classId
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || appState.classes[0]?.id || ''
  );
  const [programFilter, setProgramFilter] = useState<'ALL' | 'B. Pharm' | 'Pharm. D'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SAFE' | 'RISK'>('ALL');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'percent_asc' | 'percent_desc'>('roll');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  const cutoffPercent = appState.config.attendanceCutoffPercent ?? 80;

  // Filtered classes according to selected program
  const filteredClasses = useMemo(() => {
    if (programFilter === 'ALL') return appState.classes;
    return appState.classes.filter(c => c.program === programFilter);
  }, [appState.classes, programFilter]);

  // Current selected class object
  const currentClass = useMemo(() => {
    return appState.classes.find(c => c.id === selectedClassId) || filteredClasses[0] || appState.classes[0];
  }, [appState.classes, selectedClassId, filteredClasses]);

  // Keep selectedClassId valid if program changes
  React.useEffect(() => {
    if (filteredClasses.length > 0 && !filteredClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [programFilter, filteredClasses, selectedClassId]);

  // Students belonging to the selected class
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return (appState.students || []).filter(s => s.classId === currentClass.id);
  }, [appState.students, currentClass]);

  // Sessions conducted for this class
  const classSessions = useMemo(() => {
    if (!currentClass) return [];
    return (appState.sessions || []).filter(s => s.classId === currentClass.id);
  }, [appState.sessions, currentClass]);

  // Subjects taught in this class (from timetable or conducted sessions)
  const classSubjects = useMemo(() => {
    if (!currentClass) return [];
    const subjIdSet = new Set<string>();
    // From timetable
    appState.timetable.filter(t => t.classId === currentClass.id).forEach(t => subjIdSet.add(t.subjectId));
    // From conducted sessions
    classSessions.forEach(s => subjIdSet.add(s.subjectId));

    return Array.from(subjIdSet)
      .map(id => appState.subjects.find(s => s.id === id))
      .filter((s): s is Subject => Boolean(s));
  }, [appState.timetable, appState.subjects, classSessions, currentClass]);

  // Precalculate student stats
  const studentCalculations = useMemo(() => {
    const map = new Map<string, {
      overall: ReturnType<typeof calculateStudentOverallAttendance>;
      bySubject: Map<string, ReturnType<typeof calculateStudentAttendance>>;
      neededToReachCutoff: number;
    }>();

    classStudents.forEach(st => {
      const overall = calculateStudentOverallAttendance(
        st.id,
        currentClass?.id || '',
        appState.sessions || [],
        appState.studentAttendance || []
      );

      const bySubject = new Map<string, ReturnType<typeof calculateStudentAttendance>>();
      classSubjects.forEach(sub => {
        const subCalc = calculateStudentAttendance(
          st.id,
          sub.id,
          appState.sessions || [],
          appState.studentAttendance || []
        );
        bySubject.set(sub.id, subCalc);
      });

      // Calculate how many consecutive classes student needs to attend to reach cutoffPercent
      // (present + x) / (conducted + x) >= target/100
      let needed = 0;
      if (overall.conducted > 0 && overall.percentage < cutoffPercent) {
        const target = cutoffPercent / 100;
        // x = (target * conducted - present) / (1 - target)
        if (target < 1) {
          needed = Math.max(0, Math.ceil((target * overall.conducted - overall.present) / (1 - target)));
        }
      }

      map.set(st.id, {
        overall,
        bySubject,
        neededToReachCutoff: needed
      });
    });

    return map;
  }, [classStudents, currentClass, appState.sessions, appState.studentAttendance, classSubjects, cutoffPercent]);

  // Overall Class Statistics
  const classMetrics = useMemo(() => {
    const totalStudents = classStudents.length;
    const totalSessions = classSessions.length;

    let totalPercentages = 0;
    let safeCount = 0;
    let warningCount = 0;
    let riskCount = 0;

    classStudents.forEach(st => {
      const calc = studentCalculations.get(st.id);
      const pct = calc ? calc.overall.percentage : 100;
      totalPercentages += pct;

      if (pct >= cutoffPercent) {
        safeCount++;
      } else if (pct >= 75) {
        warningCount++;
      } else {
        riskCount++;
      }
    });

    const averagePercent = totalStudents > 0 ? Math.round(totalPercentages / totalStudents) : 100;

    return {
      totalStudents,
      totalSessions,
      averagePercent,
      safeCount,
      warningCount,
      riskCount
    };
  }, [classStudents, classSessions, studentCalculations, cutoffPercent]);

  // Filtered and Sorted Students list
  const processedStudents = useMemo(() => {
    return classStudents
      .filter(st => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q ||
          st.name.toLowerCase().includes(q) ||
          st.rollNumber.toLowerCase().includes(q) ||
          (st.admissionNumber && st.admissionNumber.toLowerCase().includes(q));

        if (!matchesQuery) return false;

        const calc = studentCalculations.get(st.id);
        const pct = calc ? calc.overall.percentage : 100;

        if (filterMode === 'SAFE') return pct >= cutoffPercent;
        if (filterMode === 'RISK') return pct < cutoffPercent;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'percent_asc') {
          const pA = studentCalculations.get(a.id)?.overall.percentage ?? 100;
          const pB = studentCalculations.get(b.id)?.overall.percentage ?? 100;
          return pA - pB;
        }
        if (sortBy === 'percent_desc') {
          const pA = studentCalculations.get(a.id)?.overall.percentage ?? 100;
          const pB = studentCalculations.get(b.id)?.overall.percentage ?? 100;
          return pB - pA;
        }
        // default: natural roll number sort
        return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [classStudents, searchQuery, filterMode, sortBy, studentCalculations, cutoffPercent]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Institutional Student Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/10 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-300 backdrop-blur-md mb-2.5 sm:mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Official Student Attendance Terminal
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Class & Section Attendance Portal
            </h2>
            <p className="text-emerald-200/80 text-xs sm:text-sm font-medium mt-1 max-w-xl">
              Select your academic class and section below to inspect overall attendance standing, subject-wise percentages, and exam eligibility thresholds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            {onBackToSchedule && (
              <button
                onClick={onBackToSchedule}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/10 shadow-sm"
              >
                <i className="fa-solid fa-calendar-days text-emerald-300"></i>
                Timetable Schedule
              </button>
            )}
            <div className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
              <i className="fa-solid fa-shield-check text-emerald-400"></i>
              Threshold: {cutoffPercent}% Required
            </div>
          </div>
        </div>

        {/* Informational banner about student roll number PDF */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] text-emerald-100/90 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0 text-xs">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <span>
              <strong>Central Roster Sync:</strong> Official student names and roll numbers are synced with the college database. PDF rosters can be imported by the administration at any time.
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-wider text-emerald-300 shrink-0">
            Realtime Firestore Sync Active
          </span>
        </div>
      </div>

      {/* Program Filter & Class/Section Selection Matrix */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-emerald-100 shadow-sm space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
              Step 1: Select Academic Program & Year
            </span>
            <h3 className="text-base sm:text-lg font-black text-emerald-950 uppercase tracking-tight">
              Class & Section Directory
            </h3>
          </div>

          {/* Program Toggle Filter */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto max-w-full">
            {(['ALL', 'B. Pharm', 'Pharm. D'] as const).map(prog => (
              <button
                key={prog}
                onClick={() => setProgramFilter(prog)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  programFilter === prog
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-white/60'
                }`}
              >
                {prog === 'ALL' ? 'All Programs' : prog}
              </button>
            ))}
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {filteredClasses.map(cls => {
            const isSelected = cls.id === currentClass?.id;
            const studentCount = (appState.students || []).filter(s => s.classId === cls.id).length;

            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`p-2.5 sm:p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[84px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/10 scale-[1.02]'
                    : 'bg-slate-50/80 hover:bg-emerald-50/70 border-slate-200/80 text-emerald-950 hover:border-emerald-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-emerald-700 border border-emerald-100'
                    }`}>
                      {cls.program === 'Pharm. D' ? 'Pharm.D' : 'B.Pharm'}
                    </span>
                    {cls.section && (
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase ${
                        isSelected ? 'text-emerald-200' : 'text-slate-500'
                      }`}>
                        Sec {cls.section}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black leading-tight line-clamp-2">
                    {cls.name}
                  </h4>
                </div>

                <div className={`mt-2 pt-1.5 border-t text-[9px] sm:text-[10px] font-bold flex items-center justify-between ${
                  isSelected ? 'border-white/20 text-emerald-100' : 'border-slate-200 text-slate-400'
                }`}>
                  <span>{studentCount} Students</span>
                  <i className={`fa-solid ${isSelected ? 'fa-circle-check text-white' : 'fa-chevron-right opacity-40'}`}></i>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Class Snapshot Banner */}
        {currentClass && (
          <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-emerald-900/10 shrink-0">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-tight">
                    {currentClass.name} {currentClass.section ? `• Section ${currentClass.section}` : ''}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    {currentClass.program}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">
                  {currentClass.semester ? `Semester: ${currentClass.semester}` : ''} 
                  {currentClass.roomNo ? ` • Room: ${currentClass.roomNo}` : ''}
                  {currentClass.incharge ? ` • Incharge: ${currentClass.incharge}` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white rounded-xl border border-emerald-100 text-center shadow-xs">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest block">Strength</span>
                <span className="text-xs sm:text-sm font-black text-emerald-950">{classMetrics.totalStudents}</span>
              </div>
              <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white rounded-xl border border-emerald-100 text-center shadow-xs">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sessions</span>
                <span className="text-xs sm:text-sm font-black text-emerald-950">{classMetrics.totalSessions}</span>
              </div>
              <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white rounded-xl border border-emerald-100 text-center shadow-xs">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest block">Average</span>
                <span className={`text-xs sm:text-sm font-black ${
                  classMetrics.averagePercent >= cutoffPercent ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {classMetrics.averagePercent}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Class Level Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg sm:text-xl shrink-0">
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Enrolled</p>
            <h4 className="text-lg sm:text-2xl font-black text-emerald-950">{classMetrics.totalStudents}</h4>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">Class Roster Size</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg sm:text-xl shrink-0">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Class Average</p>
            <h4 className={`text-lg sm:text-2xl font-black ${
              classMetrics.averagePercent >= cutoffPercent ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {classMetrics.averagePercent}%
            </h4>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">Across {classMetrics.totalSessions} Sessions</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg sm:text-xl shrink-0">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Safe Zone (≥{cutoffPercent}%)</p>
            <h4 className="text-lg sm:text-2xl font-black text-emerald-700">{classMetrics.safeCount}</h4>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">Eligible for Exam</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg sm:text-xl shrink-0">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Shortage Risk</p>
            <h4 className="text-lg sm:text-2xl font-black text-rose-600">{classMetrics.warningCount + classMetrics.riskCount}</h4>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">Below {cutoffPercent}% Benchmark</p>
          </div>
        </div>
      </div>

      {/* Main Student Roster & Attendance Table */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-emerald-100 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
              Step 2: Inspect Individual Standing
            </span>
            <h3 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
              Class Attendance Ledger ({processedStudents.length} Students)
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Roll No or Name..."
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Standing Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 justify-center">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterMode === 'ALL' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-emerald-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('SAFE')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterMode === 'SAFE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-900'
                }`}
              >
                ≥{cutoffPercent}%
              </button>
              <button
                onClick={() => setFilterMode('RISK')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterMode === 'RISK' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-rose-900'
                }`}
              >
                &lt;{cutoffPercent}%
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="Sort attendance roster by"
              className="px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="roll">Sort by Roll Number</option>
              <option value="name">Sort by Student Name</option>
              <option value="percent_asc">Attendance: Low to High</option>
              <option value="percent_desc">Attendance: High to Low</option>
            </select>
          </div>
        </div>

        {/* Scroll hint on mobile */}
        <div className="sm:hidden flex items-center justify-end gap-1 text-[10px] font-bold text-slate-400">
          <i className="fa-solid fa-arrows-left-right text-[9px]"></i>
          <span>Swipe table horizontally to see details</span>
        </div>

        {/* Table View */}
        {processedStudents.length === 0 ? (
          <div className="py-12 sm:py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg">
              <i className="fa-solid fa-users-slash"></i>
            </div>
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight">No Students Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No student records matched your search query or filter in this class section.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 -mx-1 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-3 sm:px-4">Roll Number</th>
                  <th className="py-3.5 px-3 sm:px-4">Student Name</th>
                  <th className="py-3.5 px-3 sm:px-4 hidden sm:table-cell">Admission ID</th>
                  <th className="py-3.5 px-3 sm:px-4">Attended / Total</th>
                  <th className="py-3.5 px-3 sm:px-4">Percentage</th>
                  <th className="py-3.5 px-3 sm:px-4">Exam Status</th>
                  <th className="py-3.5 px-3 sm:px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {processedStudents.map((st) => {
                  const calc = studentCalculations.get(st.id);
                  const conducted = calc ? calc.overall.conducted : 0;
                  const present = calc ? calc.overall.present : 0;
                  const percent = calc ? calc.overall.percentage : 100;
                  const isSafe = percent >= cutoffPercent;
                  const isWarning = percent >= 75 && percent < cutoffPercent;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isSafe ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-950 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                          {st.rollNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-950">
                        {st.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] hidden sm:table-cell">
                        {st.admissionNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-bold whitespace-nowrap">
                        <span className="text-emerald-950 font-black">{present}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span>{conducted}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-sm ${
                            isSafe ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-600'
                          }`}>
                            {percent}%
                          </span>
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isSafe ? 'bg-emerald-600' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSafe ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            <i className="fa-solid fa-circle-check text-[9px]"></i>
                            Eligible
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                            <i className="fa-solid fa-triangle-exclamation text-[9px]"></i>
                            Condonation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                            <i className="fa-solid fa-circle-xmark text-[9px]"></i>
                            Shortage Risk
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudentForModal(st)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border border-emerald-200"
                        >
                          Breakdown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subject-Wise Attendance Breakdown for Selected Class */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-emerald-100 shadow-sm space-y-4 sm:space-y-6">
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
            Curricular Analysis
          </span>
          <h3 className="text-base sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
            Subject-Wise Lecture & Practical Breakdown
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Overview of total sessions conducted and cumulative student presence per subject.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {classSubjects.map(sub => {
            const subSessions = classSessions.filter(s => s.subjectId === sub.id);
            const conductedCount = subSessions.length;

            // Calculate subject class average
            let totalSubPresents = 0;
            const totalPossible = conductedCount * classStudents.length;

            if (totalPossible > 0) {
              const sessionIds = new Set(subSessions.map(s => s.id));
              const studentRecords = (appState.studentAttendance || []).filter(
                r => sessionIds.has(r.sessionId) && r.status === 'present'
              );
              totalSubPresents = studentRecords.length;
            }

            const subAvgPercent = totalPossible === 0 ? 100 : Math.round((totalSubPresents / totalPossible) * 100);

            // Find teacher
            const timetableItem = appState.timetable.find(t => t.classId === currentClass?.id && t.subjectId === sub.id);
            const teacher = appState.staff.find(s => s.id === timetableItem?.facultyId);

            return (
              <div
                key={sub.id}
                className="p-3.5 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-black uppercase font-mono">
                      {sub.code || 'SUBJ'}
                    </span>
                    <span className={`text-xs font-black ${
                      subAvgPercent >= cutoffPercent ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      Avg: {subAvgPercent}%
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-emerald-950 leading-snug">
                    {sub.name}
                  </h4>
                  {teacher && (
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                      <i className="fa-solid fa-chalkboard-user text-emerald-600 text-[10px]"></i>
                      {teacher.name}
                    </p>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/80 flex items-center justify-between text-[10px] sm:text-[11px]">
                  <span className="text-slate-400 font-bold">Conducted:</span>
                  <span className="font-black text-emerald-950">{conductedCount} Classes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Personal Attendance Report Modal */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 max-w-2xl w-full border border-emerald-100 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-base sm:text-lg font-black shrink-0">
                  <i className="fa-solid fa-id-card"></i>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                    Individual Student Attendance Report
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-emerald-950">
                    {selectedStudentForModal.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {selectedStudentForModal.rollNumber}
                    </span>
                    <span>• {currentClass?.name}</span>
                    {selectedStudentForModal.admissionNumber && (
                      <span className="hidden sm:inline">• Adm: {selectedStudentForModal.admissionNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all shrink-0"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Overall Student Standing Card */}
            {(() => {
              const calc = studentCalculations.get(selectedStudentForModal.id);
              const overall = calc?.overall || { conducted: 0, present: 0, absent: 0, percentage: 100 };
              const needed = calc?.neededToReachCutoff || 0;
              const isSafe = overall.percentage >= cutoffPercent;

              return (
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border ${
                    isSafe
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/80 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-70 block">
                          Cumulative Standing
                        </span>
                        <h4 className="text-2xl font-black">
                          {overall.percentage}% Overall Attendance
                        </h4>
                        <p className="text-xs font-semibold mt-0.5 opacity-80">
                          Attended {overall.present} of {overall.conducted} classes conducted to date.
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {isSafe ? (
                          <span className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                            <i className="fa-solid fa-check"></i> Eligible for Exams
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                            <i className="fa-solid fa-triangle-exclamation"></i> Shortage Alert
                          </span>
                        )}
                      </div>
                    </div>

                    {!isSafe && needed > 0 && (
                      <div className="mt-4 pt-3 border-t border-rose-200/80 text-xs font-bold text-rose-800 flex items-center gap-2">
                        <i className="fa-solid fa-lightbulb text-rose-600"></i>
                        <span>
                          <strong>Recovery Target:</strong> Must attend the next <strong>{needed}</strong> consecutive sessions without absence to attain the {cutoffPercent}% threshold.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subject-Wise Detail Breakdown Table */}
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-3">
                      Subject-Wise Academic Ledger
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-3.5">Subject</th>
                            <th className="py-3 px-3.5">Code</th>
                            <th className="py-3 px-3.5">Attended / Total</th>
                            <th className="py-3 px-3.5 text-right">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {classSubjects.map(sub => {
                            const subCalc = calc?.bySubject.get(sub.id) || { conducted: 0, present: 0, absent: 0, percentage: 100 };
                            const subSafe = subCalc.percentage >= cutoffPercent;

                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/80">
                                <td className="py-3 px-3.5 font-bold text-emerald-950">
                                  {sub.name}
                                </td>
                                <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                                  {sub.code || '—'}
                                </td>
                                <td className="py-3 px-3.5 text-slate-600 font-semibold">
                                  {subCalc.present} / {subCalc.conducted}
                                </td>
                                <td className="py-3 px-3.5 text-right font-black">
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                                    subSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {subCalc.percentage}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
