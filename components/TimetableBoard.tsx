
import React, { useState, useEffect } from 'react';
import { getState } from '../services/dataStore';
import { AppState, TimetableEntry, StaffMember, ClassRoom, Subject, TimeSlot } from '../types';
import { formatSlotRange } from '../services/timeUtils';

const TimetableBoard: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(getState());
  const [viewMode, setViewMode] = useState<'class' | 'staff'>('class');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [targetId, setTargetId] = useState<string>('');

  useEffect(() => {
    // Keep appState fresh if dataStore changed
    const handleStorage = () => setAppState(getState());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    // Set default target based on mode
    if (viewMode === 'class' && appState.classes.length > 0) {
      if (!appState.classes.some(c => c.id === targetId)) {
        setTargetId(appState.classes[0].id);
      }
    } else if (viewMode === 'staff' && appState.staff.length > 0) {
      if (!appState.staff.some(s => s.id === targetId)) {
        setTargetId(appState.staff[0].id);
      }
    }
  }, [viewMode, appState.classes, appState.staff, targetId]);

  const filteredEntries = appState.timetable.filter(e => {
    const dayMatch = e.day === selectedDay;
    const targetMatch = viewMode === 'class' ? e.classId === targetId : e.facultyId === targetId;
    return dayMatch && targetMatch;
  });

  const getSubject = (id: string) => appState.subjects.find(s => s.id === id);
  const getFaculty = (id: string) => appState.staff.find(s => s.id === id);
  const getClass = (id: string) => appState.classes.find(c => c.id === id);

  // Filter slots appropriately for weekdays vs Saturday
  const displaySlots = appState.config.timeSlots.filter(s => 
    selectedDay === 'Saturday' ? s.id.startsWith('sat-') : !s.id.startsWith('sat-')
  );

  const selectedClass = appState.classes.find(c => c.id === targetId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="glass rounded-[3rem] p-8 md:p-12 shadow-2xl border-emerald-50">
        
        {/* Institutional Document Header */}
        <div className="mb-10 text-center border-b border-emerald-100/70 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/60 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-3">
            <i className="fa-solid fa-graduation-cap"></i> KVSRSCOPS/ACD/TT • w.e.f. 03.09.2026
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight">
            KVSR SIDDHARTHA COLLEGE OF PHARMACEUTICAL SCIENCES
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Academic Year: {appState.config.academicYear} • B. Pharm / I Year / I Semester
          </p>
          <div className="mt-3 flex flex-wrap justify-center items-center gap-4 text-[11px] font-bold text-emerald-700">
            <span className="bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <i className="fa-solid fa-user-check mr-1.5 text-emerald-500"></i>
              Class Incharge: Dr. Ch. Nagabhushanam
            </span>
            <span className="bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <i className="fa-solid fa-user-check mr-1.5 text-emerald-500"></i>
              Class Incharge: Dr. B. Naga Raju
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h2 className="text-2xl font-black text-emerald-900 mb-1">Interactive Timetable Matrix</h2>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
              {viewMode === 'class' ? (selectedClass ? `${selectedClass.name} - Section ${selectedClass.section}` : 'Class Schedule') : 'Faculty Teaching Load Matrix'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setViewMode('class')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'class' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
            >
              Class View
            </button>
            <button 
              onClick={() => setViewMode('staff')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'staff' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
            >
              Staff View
            </button>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto max-w-full">
            {appState.config.workingDays.map(day => (
              <button 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDay === day ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-700'}`}
              >
                {day.substring(0,3)}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Dropdown & Quick Switch */}
        <div className="mb-10 max-w-xl mx-auto">
          {viewMode === 'class' ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-3">
                {appState.classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setTargetId(c.id)}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${targetId === c.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' : 'bg-white text-emerald-900 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <i className="fa-solid fa-chalkboard-user mr-2"></i>
                    {c.name} - Section {c.section}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2 text-center">
                Select Faculty Member ({appState.staff.length} registered from timetable)
              </label>
              <select 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-emerald-900 focus:outline-emerald-500 shadow-inner"
              >
                {appState.staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.code ? `(${s.code})` : ''} — {s.department}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySlots.map(slot => {
            const slotEntries = filteredEntries.filter(e => e.slotId === slot.id);

            if (slot.isBreak) {
              return (
                <div key={slot.id} className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200/60 flex flex-col items-center justify-center gap-2 group transition-all min-h-[160px]">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-xl shadow-inner">
                    <i className="fa-solid fa-mug-hot"></i>
                  </div>
                  <span className="text-xs font-black text-amber-800 uppercase tracking-[0.2em]">{slot.label}</span>
                  <span className="text-[10px] font-bold text-amber-600 font-mono">{formatSlotRange(slot.start, slot.end)}</span>
                </div>
              );
            }

            return (
              <div key={slot.id} className="p-6 md:p-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 bg-emerald-50 rounded-lg text-[9px] font-black text-emerald-700 uppercase tracking-wide">
                      {slot.label}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 font-mono">
                      {formatSlotRange(slot.start, slot.end)}
                    </div>
                  </div>

                  {slotEntries.length > 0 ? (
                    <div className="space-y-4">
                      {slotEntries.map((entry, idx) => {
                        const subj = getSubject(entry.subjectId);
                        const fac = getFaculty(entry.facultyId);
                        const cls = getClass(entry.classId);

                        return (
                          <div key={entry.id || idx} className={`${slotEntries.length > 1 ? 'p-3 bg-slate-50 rounded-2xl border border-slate-100' : ''}`}>
                            {entry.batch && (
                              <span className="inline-block px-2.5 py-0.5 mb-1.5 bg-emerald-100 text-emerald-900 rounded-md text-[9px] font-black uppercase tracking-wider">
                                {entry.batch}
                              </span>
                            )}
                            <h4 className="text-base font-black text-emerald-950 mb-1 leading-snug">
                              {subj?.name || 'Assigned Subject'}
                              {subj?.code ? <span className="ml-1 text-xs text-emerald-600 font-bold">({subj.code})</span> : null}
                            </h4>

                            <div className="space-y-1 mt-2">
                              <p className="text-xs font-bold text-emerald-700 flex items-center">
                                <i className="fa-solid fa-chalkboard-user mr-2 text-emerald-500 opacity-70"></i>
                                {viewMode === 'class' ? (fac?.name || 'Designated Faculty') : `${cls?.name} - Sec ${cls?.section}`}
                                {viewMode === 'class' && fac?.code && <span className="ml-1 text-slate-500">[{fac.code}]</span>}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <i className="fa-solid fa-tag mr-2 text-slate-400 opacity-70"></i>
                                {entry.type} Session
                              </p>
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
                  <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-end text-emerald-600 text-[10px] font-bold">
                    <i className="fa-solid fa-lock mr-1"></i> Locked Slot
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Substitutions of the Day */}
        <div className="mt-16 pt-10 border-t border-emerald-100/70">
          <h3 className="text-center text-emerald-900 font-black uppercase tracking-widest text-xs mb-8">
            Daily Academic Substitutions & Notices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
             {appState.substitutions.filter(s => s.status === 'Approved').length === 0 ? (
               <p className="col-span-2 text-center text-[11px] font-bold text-slate-400 italic bg-slate-50 py-4 rounded-2xl">
                 No active faculty substitutions recorded for today. Standard photo timetable in effect.
               </p>
             ) : (
               appState.substitutions.filter(s => s.status === 'Approved').map(sub => {
                 const subFac = getFaculty(sub.substituteFacultyId);
                 const origFac = getFaculty(sub.originalFacultyId);
                 return (
                   <div key={sub.id} className="p-4 bg-emerald-950 rounded-2xl text-white flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <i className="fa-solid fa-user-clock"></i>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-emerald-500 uppercase">Substitution</p>
                         <p className="text-xs font-bold">
                           {subFac?.name || 'Substitute'} replacing {origFac?.name || 'Original'}
                         </p>
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimetableBoard;
