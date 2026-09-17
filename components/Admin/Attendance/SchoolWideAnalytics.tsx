import React, { useState, useMemo } from 'react';
import { AppState, ClassRoom, Subject, Student, AttendanceSession } from '../../../types';
import { calculateStudentAttendance, calculateStudentOverallAttendance } from '../../../services/attendanceService';

interface SchoolWideAnalyticsProps {
  appState: AppState;
  onUpdateCutoff: (newCutoff: number) => void;
  triggerAlert: (title: string, message: string) => void;
}

export const SchoolWideAnalytics: React.FC<SchoolWideAnalyticsProps> = ({
  appState,
  onUpdateCutoff,
  triggerAlert
}) => {
  const cutoff = appState.config.attendanceCutoffPercent ?? 80;
  const [selectedProgram, setSelectedProgram] = useState<'ALL' | 'B. Pharm' | 'Pharm. D'>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cutoffInput, setCutoffInput] = useState<number>(cutoff);

  const students = appState.students || [];
  const sessions = appState.sessions || [];
  const attendance = appState.studentAttendance || [];

  // Filtered classes based on program filter
  const filteredClasses = useMemo(() => {
    return appState.classes.filter(c => {
      if (selectedProgram === 'ALL') return true;
      return c.program === selectedProgram;
    });
  }, [appState.classes, selectedProgram]);

  // Overall institutional metrics
  const institutionalMetrics = useMemo(() => {
    const totalStudents = students.length;
    const totalSessions = sessions.length;
    const totalRecords = attendance.length;
    const totalPresents = attendance.filter(a => a.status === 'present').length;

    const overallRate = totalRecords > 0 ? Math.round((totalPresents / totalRecords) * 100) : 0;

    // Identify low attendance students (< cutoff overall)
    const lowAttendanceStudents = students.filter(st => {
      const stats = calculateStudentOverallAttendance(st.id, st.classId, sessions, attendance);
      return stats.conducted > 0 && stats.percentage < cutoff;
    });

    return {
      totalStudents,
      totalSessions,
      overallRate,
      lowCount: lowAttendanceStudents.length
    };
  }, [students, sessions, attendance, cutoff]);

  // Watchlist of students with low attendance (< cutoff in at least one subject, or overall)
  const lowAttendanceWatchlist = useMemo(() => {
    const list: {
      student: Student;
      cls: ClassRoom | undefined;
      subjectMetrics: { subject: Subject; percent: number; present: number; conducted: number }[];
      overallPercent: number;
    }[] = [];

    students.forEach(st => {
      const cls = appState.classes.find(c => c.id === st.classId);
      if (selectedProgram !== 'ALL' && cls?.program !== selectedProgram) return;
      if (selectedClassId !== 'ALL' && st.classId !== selectedClassId) return;

      const q = searchQuery.toLowerCase().trim();
      if (q && !st.name.toLowerCase().includes(q) && !st.rollNumber.toLowerCase().includes(q)) {
        return;
      }

      // Calculate for each subject in this student's class
      const classSessions = sessions.filter(s => s.classId === st.classId);
      const subjectIds: string[] = Array.from(new Set(classSessions.map(s => s.subjectId)));

      const lowSubjects: { subject: Subject; percent: number; present: number; conducted: number }[] = [];

      subjectIds.forEach(subId => {
        const sub = appState.subjects.find(s => s.id === subId);
        if (!sub) return;
        const metrics = calculateStudentAttendance(st.id, subId, sessions, attendance);
        if (metrics.conducted > 0 && metrics.percentage < cutoff) {
          lowSubjects.push({
            subject: sub,
            percent: metrics.percentage,
            present: metrics.present,
            conducted: metrics.conducted
          });
        }
      });

      const overall = calculateStudentOverallAttendance(st.id, st.classId, sessions, attendance);

      if (lowSubjects.length > 0 || (overall.conducted > 0 && overall.percentage < cutoff)) {
        list.push({
          student: st,
          cls,
          subjectMetrics: lowSubjects,
          overallPercent: overall.percentage
        });
      }
    });

    // Sort by overall attendance ascending (most critical first)
    return list.sort((a, b) => a.overallPercent - b.overallPercent);
  }, [students, sessions, attendance, cutoff, selectedProgram, selectedClassId, searchQuery, appState.classes, appState.subjects]);

  // Class-wise summary cards
  const classSummaries = useMemo(() => {
    return filteredClasses.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id);
      const classSessions = sessions.filter(s => s.classId === cls.id);
      const classRecords = attendance.filter(a => {
        return classSessions.some(cs => cs.id === a.sessionId);
      });

      const presentCount = classRecords.filter(r => r.status === 'present').length;
      const avgRate = classRecords.length > 0 ? Math.round((presentCount / classRecords.length) * 100) : 0;

      const lowCount = classStudents.filter(st => {
        const stats = calculateStudentOverallAttendance(st.id, cls.id, sessions, attendance);
        return stats.conducted > 0 && stats.percentage < cutoff;
      }).length;

      return {
        cls,
        studentCount: classStudents.length,
        sessionCount: classSessions.length,
        avgRate,
        lowCount
      };
    });
  }, [filteredClasses, students, sessions, attendance, cutoff]);

  // Audit Logs of sessions
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime())
      .slice(0, 15);
  }, [sessions]);

  // Handle saving new cutoff
  const handleSaveCutoff = () => {
    if (cutoffInput < 50 || cutoffInput > 100) {
      triggerAlert('Invalid Value', 'Attendance threshold must be between 50% and 100%.');
      return;
    }
    onUpdateCutoff(cutoffInput);
    triggerAlert('Policy Updated', `Institutional attendance cutoff benchmark updated to ${cutoffInput}%.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in fill-mode-both">
      {/* Principal Executive Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Institutional Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">
                {institutionalMetrics.overallRate}%
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Campus Average
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Total Sessions Held
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">
                {institutionalMetrics.totalSessions}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Logged Sessions
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Monitored Students
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">
                {institutionalMetrics.totalStudents}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Across 12 Classes
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-1">
              Watchlist (&lt; {cutoff}%)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-950">
                {institutionalMetrics.lowCount}
              </span>
              <span className="text-xs font-bold text-rose-600">
                At-Risk Students
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
      </div>

      {/* Configurable Cutoff Ribbon */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-base shrink-0">
            <i className="fa-solid fa-sliders"></i>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
              Institutional Cutoff Threshold Benchmark
            </h4>
            <p className="text-[11px] font-medium text-slate-500">
              Students falling below this threshold in any subject are flagged and highlighted in red across all faculty portals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="50"
              max="100"
              value={cutoffInput}
              onChange={e => setCutoffInput(Number(e.target.value))}
              className="w-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-xs font-black text-slate-500">%</span>
          </div>
          <button
            type="button"
            onClick={handleSaveCutoff}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
          >
            Apply Policy
          </button>
        </div>
      </div>

      {/* Program & Class Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'B. Pharm', 'Pharm. D'] as const).map(p => (
            <button
              key={p}
              onClick={() => {
                setSelectedProgram(p);
                setSelectedClassId('ALL');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                selectedProgram === p
                  ? 'bg-emerald-950 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {p === 'ALL' ? 'All Programs' : p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Program Classes</option>
            {filteredClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Matrices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classSummaries.map(({ cls, studentCount, sessionCount, avgRate, lowCount }) => {
          const isClassLow = avgRate < cutoff && sessionCount > 0;
          return (
            <div
              key={cls.id}
              className={`bg-white p-6 rounded-[2rem] border transition-all ${
                isClassLow 
                  ? 'border-rose-200 shadow-sm' 
                  : 'border-slate-100 shadow-sm hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {cls.program}
                  </span>
                  <h4 className="text-base font-black text-emerald-950 mt-2">
                    {cls.name} <span className="text-slate-400 font-bold">({cls.section})</span>
                  </h4>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                  avgRate >= cutoff
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-rose-100 text-rose-900'
                }`}>
                  {avgRate}% Avg
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Students</span>
                  <span className="text-xs font-black text-slate-800">{studentCount}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Sessions</span>
                  <span className="text-xs font-black text-slate-800">{sessionCount}</span>
                </div>
                <div className={`p-2 rounded-xl ${lowCount > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                  <span className={`text-[9px] font-black uppercase block ${lowCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    &lt; {cutoff}%
                  </span>
                  <span className={`text-xs font-black ${lowCount > 0 ? 'text-rose-900' : 'text-slate-800'}`}>
                    {lowCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Attendance Watchlist Table */}
      <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-base font-black text-rose-950 uppercase tracking-tight">
                Low Attendance Watchlist (Below {cutoff}% Benchmark)
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Active cases requiring academic intervention, student mentoring, or parent notification.
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {lowAttendanceWatchlist.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold">
            ✓ No students are currently below the {cutoff}% cutoff for this filter criteria!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                  <th className="p-3 pl-4">Roll Number</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Overall %</th>
                  <th className="p-3 pr-4">Deficient Subjects (&lt; {cutoff}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowAttendanceWatchlist.map(({ student, cls, subjectMetrics, overallPercent }) => (
                  <tr key={student.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="p-3 pl-4 font-mono font-black text-emerald-950">
                      {student.rollNumber}
                    </td>
                    <td className="p-3 font-black text-emerald-950">
                      {student.name}
                    </td>
                    <td className="p-3 font-semibold text-slate-600">
                      {cls?.name} ({cls?.section})
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                        overallPercent < cutoff 
                          ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {overallPercent}%
                      </span>
                    </td>
                    <td className="p-3 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {subjectMetrics.map((sm, smIdx) => (
                          <span
                            key={smIdx}
                            className="px-2 py-0.5 rounded-md bg-rose-100/70 border border-rose-200 text-rose-900 font-bold text-[10px]"
                            title={`${sm.subject.name}: ${sm.present}/${sm.conducted} sessions`}
                          >
                            {sm.subject.code}: <strong>{sm.percent}%</strong> ({sm.present}/{sm.conducted})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Audit Trail */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <div>
            <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
              Institutional Session Audit Trail
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Comprehensive tamper-evident record of marked sessions, faculty submitters, and modification logs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4">Date & Period</th>
                <th className="p-3">Class</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Marked By</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 pr-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSessions.map(ses => {
                const cls = appState.classes.find(c => c.id === ses.classId);
                const sub = appState.subjects.find(s => s.id === ses.subjectId);
                const hasRevisions = ses.auditTrail && ses.auditTrail.length > 1;

                return (
                  <tr key={ses.id} className="hover:bg-slate-50/50">
                    <td className="p-3 pl-4 font-bold text-slate-800">
                      {ses.date} <span className="text-slate-400 font-semibold block text-[11px]">Period {ses.periodNumber}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {cls?.name} ({cls?.section})
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {sub?.name} ({sub?.code})
                    </td>
                    <td className="p-3 font-black text-emerald-950">
                      {ses.markedBy}
                    </td>
                    <td className="p-3 text-slate-400 font-medium text-[11px]">
                      {new Date(ses.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 pr-4">
                      {hasRevisions ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
                          <i className="fa-solid fa-pen"></i> Revised ({ses.auditTrail!.length - 1})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit">
                          ✓ Initial
                        </span>
                      )}
                      {ses.notes && (
                        <span className="text-[10px] italic text-slate-500 block mt-0.5">
                          "{ses.notes}"
                        </span>
                      )}
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
};
