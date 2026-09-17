import React, { useState, useEffect, useMemo } from 'react';
import { getState } from '../services/dataStore';
import { AppState, TimetableEntry, StaffMember, ClassRoom, Subject, TimeSlot } from '../types';
import { formatSlotRange } from '../services/timeUtils';
import { StudentClassAttendanceView } from './Student/StudentClassAttendanceView';

export interface TimetableBoardProps {
  initialViewMode?: 'class' | 'staff' | 'attendance';
}

const TimetableBoard: React.FC<TimetableBoardProps> = ({ initialViewMode = 'class' }) => {
  const [appState, setAppState] = useState<AppState>(getState());
  const [viewMode, setViewMode] = useState<'class' | 'staff' | 'attendance'>(initialViewMode);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [targetId, setTargetId] = useState<string>('');
  const [programFilter, setProgramFilter] = useState<'ALL' | 'B. Pharm' | 'Pharm. D'>('ALL');
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>('ALL');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Sync with initialViewMode if provided
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  useEffect(() => {
    // Keep appState fresh if dataStore changed
    const handleStorage = () => setAppState(getState());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filtered classes based on selected program tab
  const displayedClasses = useMemo(() => {
    if (programFilter === 'ALL') return appState.classes;
    return appState.classes.filter(c => c.program === programFilter);
  }, [appState.classes, programFilter]);

  // Ensure valid targetId when mode or filters change
  useEffect(() => {
    if (viewMode === 'class' && displayedClasses.length > 0) {
      if (!displayedClasses.some(c => c.id === targetId)) {
        setTargetId(displayedClasses[0].id);
      }
    } else if (viewMode === 'staff' && appState.staff.length > 0) {
      if (!appState.staff.some(s => s.id === targetId)) {
        setTargetId(appState.staff[0].id);
      }
    }
  }, [viewMode, displayedClasses, appState.staff, targetId]);

  const selectedClass = useMemo(() => {
    return appState.classes.find(c => c.id === targetId);
  }, [appState.classes, targetId]);

  const selectedFaculty = useMemo(() => {
    return appState.staff.find(s => s.id === targetId);
  }, [appState.staff, targetId]);

  // Unique departments for staff filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    appState.staff.forEach(s => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [appState.staff]);

  const filteredStaffList = useMemo(() => {
    return appState.staff.filter(s => {
      const matchesDept = staffDeptFilter === 'ALL' || s.department === staffDeptFilter;
      const q = staffSearchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        s.name.toLowerCase().includes(q) || 
        (s.code && s.code.toLowerCase().includes(q)) ||
        s.department.toLowerCase().includes(q);
      return matchesDept && matchesQuery;
    });
  }, [appState.staff, staffDeptFilter, staffSearchQuery]);

  const filteredEntries = useMemo(() => {
    return appState.timetable.filter(e => {
      const dayMatch = e.day === selectedDay;
      const targetMatch = viewMode === 'class' ? e.classId === targetId : e.facultyId === targetId;
      return dayMatch && targetMatch;
    });
  }, [appState.timetable, selectedDay, viewMode, targetId]);

  const getSubject = (id: string) => appState.subjects.find(s => s.id === id);
  const getFaculty = (id: string) => appState.staff.find(s => s.id === id);
  const getClass = (id: string) => appState.classes.find(c => c.id === id);

  // Filter slots appropriately for weekdays vs Saturday
  const displaySlots = useMemo(() => {
    return appState.config.timeSlots.filter(s => 
      selectedDay === 'Saturday' ? s.id.startsWith('sat-') : !s.id.startsWith('sat-')
    );
  }, [appState.config.timeSlots, selectedDay]);

  // Faculty statistics for today
  const facultyDayLoad = useMemo(() => {
    if (viewMode !== 'staff') return 0;
    return filteredEntries.length;
  }, [viewMode, filteredEntries]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
      <div className="glass rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-4 sm:p-6 md:p-12 shadow-2xl border border-emerald-50">
        
        {/* Institutional Document Header */}
        <header className="mb-6 sm:mb-8 text-center border-b border-emerald-100/70 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 bg-emerald-100/70 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-2 sm:mb-3 shadow-xs">
            <i className="fa-solid fa-graduation-cap text-emerald-700"></i>
            KVSRSCOPS / ACD / TT • OFFICIAL TIMETABLE
          </div>

          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-emerald-950 tracking-tight leading-snug">
            KVSR SIDDHARTHA COLLEGE OF PHARMACEUTICAL SCIENCES
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Siddhartha Nagar, Vijayawada • Academic Year: {appState.config.academicYear}
          </p>

          {/* Dynamic Program / Class / Staff Details */}
          {viewMode === 'class' && selectedClass ? (
            <div className="mt-4 sm:mt-5 max-w-4xl mx-auto bg-gradient-to-r from-emerald-50/90 via-slate-50 to-emerald-50/90 p-3 sm:p-4 rounded-2xl border border-emerald-100/80 shadow-xs">
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs font-bold">
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">
                  {selectedClass.name} {selectedClass.section ? `— Section ${selectedClass.section}` : ''}
                </span>

                {selectedClass.semester && (
                  <span className="px-3 py-1 bg-white text-emerald-900 rounded-xl border border-emerald-100 shadow-xs">
                    <i className="fa-solid fa-book-open mr-1.5 text-emerald-600"></i>
                    {selectedClass.semester}
                  </span>
                )}

                {selectedClass.roomNo && (
                  <span className="px-3 py-1 bg-white text-emerald-900 rounded-xl border border-emerald-100 shadow-xs">
                    <i className="fa-solid fa-door-open mr-1.5 text-emerald-600"></i>
                    {selectedClass.roomNo}
                  </span>
                )}

                {selectedClass.effectiveDate && (
                  <span className="px-3 py-1 bg-white text-slate-600 rounded-xl border border-slate-200 shadow-xs">
                    <i className="fa-solid fa-calendar-check mr-1.5 text-emerald-600"></i>
                    {selectedClass.effectiveDate}
                  </span>
                )}
              </div>

              {selectedClass.incharge && (
                <div className="mt-2.5 sm:mt-3 flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-emerald-800">
                  <i className="fa-solid fa-user-check text-emerald-600"></i>
                  <span>Class Incharge:</span>
                  <span className="text-emerald-950 font-black">{selectedClass.incharge}</span>
                </div>
              )}
            </div>
          ) : viewMode === 'staff' && selectedFaculty ? (
            <div className="mt-4 sm:mt-5 max-w-3xl mx-auto bg-gradient-to-r from-emerald-50/90 via-slate-50 to-emerald-50/90 p-3 sm:p-4 rounded-2xl border border-emerald-100/80 shadow-xs">
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs font-bold">
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">
                  {selectedFaculty.name} {selectedFaculty.code ? `[${selectedFaculty.code}]` : ''}
                </span>
                <span className="px-3 py-1 bg-white text-emerald-900 rounded-xl border border-emerald-100 shadow-xs">
                  <i className="fa-solid fa-microscope mr-1.5 text-emerald-600"></i>
                  {selectedFaculty.department}
                </span>
                <span className="px-3 py-1 bg-white text-slate-700 rounded-xl border border-emerald-100 shadow-xs">
                  <i className="fa-solid fa-calendar-day mr-1.5 text-emerald-600"></i>
                  {selectedDay}: {facultyDayLoad} Scheduled Session{facultyDayLoad !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ) : null}
        </header>

        {/* View Switcher & Day Navigation */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 sm:mb-8 gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">Institutional Portal</h2>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
              {viewMode === 'class' 
                ? 'Classroom Schedule Matrix' 
                : viewMode === 'staff' 
                ? 'Faculty Individual Workload Matrix' 
                : 'Student Class & Section Attendance Ledger'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 sm:flex bg-slate-100 p-1 sm:p-1.5 rounded-2xl shadow-inner gap-1 w-full sm:w-auto">
            <button 
              onClick={() => setViewMode('class')}
              className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'class' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <i className="fa-solid fa-chalkboard text-xs"></i>
              <span>Class</span>
            </button>
            <button 
              onClick={() => setViewMode('staff')}
              className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'staff' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <i className="fa-solid fa-user-tie text-xs"></i>
              <span>Faculty</span>
            </button>
            <button 
              onClick={() => setViewMode('attendance')}
              className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'attendance' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <i className="fa-solid fa-clipboard-user text-xs"></i>
              <span>Attendance</span>
            </button>
          </div>

          {/* Right Controls: Three Program Buttons on Top of Day Selector (for Schedule views) */}
          {viewMode !== 'attendance' ? (
            <div className="flex flex-col items-stretch sm:items-center lg:items-end gap-2 sm:gap-2.5 w-full sm:w-auto">
              {/* Three Program Filter Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner gap-1 overflow-x-auto justify-center sm:justify-start">
                {(['ALL', 'B. Pharm', 'Pharm. D'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setProgramFilter(p);
                      if (viewMode !== 'class') setViewMode('class');
                    }}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      programFilter === p && viewMode === 'class'
                        ? 'bg-emerald-950 text-white shadow-md'
                        : 'text-slate-600 hover:text-emerald-800 hover:bg-white/50'
                    }`}
                  >
                    {p === 'ALL' ? 'All Programs' : p}
                  </button>
                ))}
              </div>

              {/* Day Selector */}
              <div className="flex bg-slate-100 p-1 sm:p-1.5 rounded-2xl overflow-x-auto max-w-full shadow-inner gap-1 scroll-smooth">
                {appState.config.workingDays.map(day => (
                  <button 
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap text-center min-w-[40px] ${
                      selectedDay === day 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-emerald-800'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                <i className="fa-solid fa-users-viewfinder mr-1.5 text-emerald-600"></i>
                Student Attendance Registry
              </span>
            </div>
          )}
        </div>

        {/* Attendance Tab View */}
        {viewMode === 'attendance' ? (
          <StudentClassAttendanceView
            appState={appState}
            initialClassId={targetId}
            onBackToSchedule={() => setViewMode('class')}
          />
        ) : (
          <>
            {/* Dynamic Selector Bar */}
        {viewMode === 'class' ? (
          <div className="mb-10 space-y-4">
            {/* Class Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {displayedClasses.map(c => {
                const isSelected = targetId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setTargetId(c.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[82px] ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                        : 'bg-white text-emerald-950 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                          {c.program || 'Class'}
                        </span>
                        {c.roomNo && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {c.roomNo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-black mt-1 leading-snug">
                        {c.name} {c.section ? `- Sec ${c.section}` : ''}
                      </p>
                    </div>

                    {c.incharge && (
                      <p className={`text-[9px] font-medium truncate mt-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {c.incharge.split('&')[0]}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Staff Selector */
          <div className="mb-10 max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Department Filter */}
              <div className="sm:w-1/3">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">
                  Department Filter
                </label>
                <select
                  value={staffDeptFilter}
                  onChange={(e) => setStaffDeptFilter(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                >
                  <option value="ALL">All Departments ({appState.staff.length} Faculty)</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Search Faculty */}
              <div className="sm:w-2/3">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">
                  Search Faculty by Name or Code
                </label>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="e.g. Karuna Sree, CHNB, KRS, TSD, GVK..."
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  />
                  {staffSearchQuery && (
                    <button
                      onClick={() => setStaffSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Staff Dropdown */}
            <div>
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">
                Select Faculty Member ({filteredStaffList.length} matching)
              </label>
              <select 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-emerald-950 focus:outline-emerald-500 shadow-sm"
              >
                {filteredStaffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.code ? `[${s.code}]` : ''} — {s.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Timetable Period Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySlots.map(slot => {
            const slotEntries = filteredEntries.filter(e => e.slotId === slot.id);

            if (slot.isBreak) {
              return (
                <div key={slot.id} className="p-6 rounded-3xl bg-amber-50/90 border border-amber-200/70 flex flex-col items-center justify-center gap-2 group transition-all min-h-[160px]">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 text-xl shadow-inner">
                    <i className="fa-solid fa-mug-hot"></i>
                  </div>
                  <span className="text-xs font-black text-amber-900 uppercase tracking-[0.2em]">{slot.label}</span>
                  <span className="text-[11px] font-bold text-amber-700 font-mono">{formatSlotRange(slot.start, slot.end)}</span>
                </div>
              );
            }

            return (
              <div 
                key={slot.id} 
                className={`p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-[2rem] bg-white border shadow-xs hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between ${
                  slotEntries.length > 0 ? 'border-emerald-100' : 'border-slate-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-800 uppercase tracking-wide">
                      {slot.label}
                    </div>
                    <div className="text-xs font-bold text-slate-500 font-mono">
                      {formatSlotRange(slot.start, slot.end)}
                    </div>
                  </div>

                  {slotEntries.length > 0 ? (
                    <div className="space-y-4">
                      {slotEntries.map((entry, idx) => {
                        const subj = getSubject(entry.subjectId);
                        const fac = getFaculty(entry.facultyId);
                        const cls = getClass(entry.classId);

                        // Visual tag styling for different session types
                        const typeBadgeColor = 
                          entry.type === 'Lab' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                          entry.type === 'Clinical' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                          entry.type === 'Seminar' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                          'bg-emerald-50 text-emerald-800 border-emerald-100';

                        return (
                          <div 
                            key={entry.id || idx} 
                            className={`p-3.5 rounded-2xl transition-all ${
                              slotEntries.length > 1 
                                ? 'bg-slate-50/80 border border-slate-200/80 mb-2' 
                                : 'bg-emerald-50/25 border border-emerald-100/60'
                            }`}
                          >
                            {/* Badges row: Batch & Type */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                              {entry.batch && (
                                <span className="inline-block px-2.5 py-0.5 bg-emerald-700 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                                  {entry.batch}
                                </span>
                              )}
                              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${typeBadgeColor}`}>
                                {entry.type}
                              </span>
                            </div>

                            {/* Subject Title */}
                            <h4 className="text-sm md:text-base font-black text-emerald-950 mb-1.5 leading-snug">
                              {subj?.name || 'Assigned Subject'}
                              {subj?.code ? (
                                <span className="ml-1.5 text-xs text-emerald-700 font-bold font-mono">
                                  [{subj.code}]
                                </span>
                              ) : null}
                            </h4>

                            {/* Assigned Faculty or Class info */}
                            <div className="space-y-1.5 mt-2">
                              <p className="text-xs font-bold text-emerald-800 flex items-center">
                                <i className="fa-solid fa-chalkboard-user mr-2 text-emerald-600 opacity-80"></i>
                                {viewMode === 'class' ? (
                                  <span>
                                    {fac?.name || 'Designated Faculty'}
                                    {fac?.code && (
                                      <span className="ml-1.5 text-emerald-600 font-bold">[{fac.code}]</span>
                                    )}
                                  </span>
                                ) : (
                                  <span>
                                    {cls?.name} {cls?.section ? `- Sec ${cls.section}` : ''}
                                    {cls?.roomNo && <span className="ml-1.5 text-slate-500">({cls.roomNo})</span>}
                                  </span>
                                )}
                              </p>

                              {/* Special Session / Room / Lab descriptor */}
                              {entry.roomOrLab && (
                                <p className="text-[11px] font-semibold text-slate-600 flex items-center">
                                  <i className="fa-solid fa-location-dot mr-2 text-emerald-500 opacity-70"></i>
                                  {entry.roomOrLab}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-28 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                      <i className="fa-regular fa-calendar-xmark text-lg mb-1 opacity-50"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">Free Period</p>
                    </div>
                  )}
                </div>

                {slotEntries.some(e => e.isLocked) && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-emerald-700 text-[10px] font-bold">
                    <i className="fa-solid fa-lock mr-1 text-emerald-600"></i> Locked Period
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Academic Notices & Substitutions Footer */}
        <footer className="mt-14 pt-8 border-t border-emerald-100/70">
          <h3 className="text-center text-emerald-950 font-black uppercase tracking-widest text-xs mb-6">
            Institutional Notices & Daily Faculty Substitutions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {appState.substitutions.filter(s => s.status === 'Approved').length === 0 ? (
              <div className="col-span-2 text-center text-xs font-bold text-slate-500 bg-slate-50/90 py-4 px-6 rounded-2xl border border-slate-100">
                <i className="fa-solid fa-circle-check text-emerald-500 mr-2"></i>
                Official institutional timetable in effect across all B. Pharm and Pharm. D classes.
              </div>
            ) : (
              appState.substitutions.filter(s => s.status === 'Approved').map(sub => {
                const subFac = getFaculty(sub.substituteFacultyId);
                const origFac = getFaculty(sub.originalFacultyId);
                return (
                  <div key={sub.id} className="p-4 bg-emerald-950 rounded-2xl text-white flex gap-4 items-center shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <i className="fa-solid fa-user-clock"></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-emerald-400 uppercase">Substitution</p>
                      <p className="text-xs font-bold">
                        {subFac?.name || 'Substitute'} replacing {origFac?.name || 'Original'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </footer>
      </>
    )}

      </div>
    </div>
  );
};

export default TimetableBoard;
