import React, { useState } from 'react';
import { AppState, AttendanceSession, StudentAttendanceEntry, Student, StaffMember } from '../../../types';
import { AttendanceMarker } from './AttendanceMarker';
import { StudentRosterManager } from './StudentRosterManager';
import { SchoolWideAnalytics } from './SchoolWideAnalytics';

interface AttendanceManagerProps {
  appState: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  userRole: 'admin' | 'principal' | null;
  triggerAlert: (title: string, message: string) => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  appState,
  onUpdateState,
  userRole,
  triggerAlert,
  triggerConfirm
}) => {
  // Navigation tabs:
  // Principal: 'analytics' | 'mark' | 'roster'
  // Admin/Teacher: 'mark' | 'roster' | 'history'
  const [subTab, setSubTab] = useState<'analytics' | 'mark' | 'roster' | 'history'>(
    userRole === 'principal' ? 'analytics' : 'mark'
  );

  // Selected faculty identity for teacher panel
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    appState.staff[0]?.id || ''
  );

  // Handler to persist attendance session and student marks
  const handleSaveSession = (newSession: AttendanceSession, newEntries: StudentAttendanceEntry[]) => {
    onUpdateState(prev => {
      // 1. Update or append session
      const existingSessionIdx = (prev.sessions || []).findIndex(s => s.id === newSession.id);
      let updatedSessions = [...(prev.sessions || [])];
      if (existingSessionIdx !== -1) {
        updatedSessions[existingSessionIdx] = newSession;
      } else {
        updatedSessions.unshift(newSession);
      }

      // 2. Remove old entries for this session and append new ones
      const otherEntries = (prev.studentAttendance || []).filter(e => e.sessionId !== newSession.id);
      const updatedAttendance = [...otherEntries, ...newEntries];

      // 3. Log
      const presentCount = newEntries.filter(e => e.status === 'present').length;
      const totalCount = newEntries.length;
      const logAction = `Attendance: ${newSession.markedBy} marked session for [${newSession.classId}] - ${newSession.date} P${newSession.periodNumber} (${presentCount}/${totalCount} Present)`;

      const newLogs = [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          user: userRole === 'principal' ? 'Principal (Dr. A. Suneetha)' : 'Faculty/Admin',
          action: logAction
        },
        ...prev.logs
      ];

      return {
        ...prev,
        sessions: updatedSessions,
        studentAttendance: updatedAttendance,
        logs: newLogs
      };
    });

    triggerAlert(
      'Attendance Synchronized',
      `Session attendance successfully recorded and synced.\n\nDate: ${newSession.date} (Period ${newSession.periodNumber})\nMarked by: ${newSession.markedBy}`
    );
  };

  // Handler to update students
  const handleUpdateStudents = (updatedStudents: Student[], logMessage: string) => {
    onUpdateState(prev => ({
      ...prev,
      students: updatedStudents,
      logs: [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          user: userRole === 'principal' ? 'Principal (Dr. A. Suneetha)' : 'Admin',
          action: logMessage
        },
        ...prev.logs
      ]
    }));
  };

  // Handler to update cutoff percent
  const handleUpdateCutoff = (newCutoff: number) => {
    onUpdateState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        attendanceCutoffPercent: newCutoff
      },
      logs: [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          user: 'Principal (Dr. A. Suneetha)',
          action: `Attendance policy updated: Threshold benchmark set to ${newCutoff}%`
        },
        ...prev.logs
      ]
    }));
  };

  const currentTeacherObj = appState.staff.find(s => s.id === selectedTeacherId);

  return (
    <div className="space-y-8 animate-in fade-in fill-mode-both">
      {/* Top Suite Header & Role Badging */}
      <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-emerald-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-white flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-emerald-900/20">
            <i className="fa-solid fa-clipboard-user"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                userRole === 'principal' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                {userRole === 'principal' ? 'Principal Authority (Dr. A. Suneetha)' : 'Admin & Faculty Panel'}
              </span>
              <span className="text-slate-400 text-xs font-bold">&bull;</span>
              <span className="text-xs font-bold text-slate-500">
                Academic Year {appState.config.academicYear}
              </span>
            </div>
            <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight mt-1">
              Attendance Management Center
            </h2>
          </div>
        </div>

        {/* Teacher Mode Faculty Identity Switcher */}
        {userRole !== 'principal' && (
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 pl-2">
              Active Faculty:
            </span>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="bg-white px-3 py-2 rounded-xl text-xs font-black text-emerald-950 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
            >
              {appState.staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || s.department})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sub-Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {userRole === 'principal' && (
          <button
            type="button"
            onClick={() => setSubTab('analytics')}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === 'analytics'
                ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-chart-pie"></i>
            School-Wide Analytics
          </button>
        )}

        <button
          type="button"
          onClick={() => setSubTab('mark')}
          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'mark'
              ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <i className="fa-solid fa-check-to-slot"></i>
          Mark Attendance (Terminal)
        </button>

        <button
          type="button"
          onClick={() => setSubTab('roster')}
          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'roster'
              ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <i className="fa-solid fa-users"></i>
          Class Rosters & Excel Import
        </button>

        {userRole !== 'principal' && (
          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === 'history'
                ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            Session History & Audits
          </button>
        )}
      </div>

      {/* Sub-Tab Contents */}
      {subTab === 'analytics' && userRole === 'principal' && (
        <SchoolWideAnalytics
          appState={appState}
          onUpdateCutoff={handleUpdateCutoff}
          triggerAlert={triggerAlert}
        />
      )}

      {subTab === 'mark' && (
        <AttendanceMarker
          appState={appState}
          userRole={userRole}
          selectedTeacherId={selectedTeacherId}
          onSaveSession={handleSaveSession}
          triggerAlert={triggerAlert}
          triggerConfirm={triggerConfirm}
        />
      )}

      {subTab === 'roster' && (
        <StudentRosterManager
          appState={appState}
          onUpdateStudents={handleUpdateStudents}
          triggerAlert={triggerAlert}
          triggerConfirm={triggerConfirm}
        />
      )}

      {subTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                Faculty Attendance Activity & Past Sessions
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Review submitted attendance registers and conflict audit notes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-3 pl-4">Session Date</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Marked By</th>
                  <th className="p-3 pr-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(appState.sessions || []).slice(0, 20).map(ses => {
                  const cls = appState.classes.find(c => c.id === ses.classId);
                  const sub = appState.subjects.find(s => s.id === ses.subjectId);
                  const isMarkedByCurrent = currentTeacherObj && ses.markedBy.includes(currentTeacherObj.name);

                  return (
                    <tr key={ses.id} className={`hover:bg-slate-50/50 ${isMarkedByCurrent ? 'bg-emerald-50/20' : ''}`}>
                      <td className="p-3 pl-4 font-black text-emerald-950">
                        {ses.date}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        Period {ses.periodNumber}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {cls?.name} ({cls?.section})
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {sub?.name} ({sub?.code})
                      </td>
                      <td className="p-3 font-bold text-emerald-900">
                        {ses.markedBy}
                      </td>
                      <td className="p-3 pr-4">
                        {ses.auditTrail && ses.auditTrail.length > 1 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                            Modified ({ses.auditTrail.length - 1} edits)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            Locked & Recorded
                          </span>
                        )}
                        {ses.notes && (
                          <p className="text-[10px] italic text-slate-500 mt-0.5">
                            "{ses.notes}"
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
