
import React, { useState, useEffect } from 'react';
import { getState, saveState, getRole } from '../../services/dataStore';
import { AppState, StaffMember, Subject, ClassRoom, TimetableEntry, SystemLog, AttendanceRecord, LeaveRequest } from '../../types';
import { detectConflicts } from '../../services/coreEngine';
import { syncToCloud, fetchFromCloud } from '../../services/googleSheetsService';
import { fetchStateFromFirestore } from '../../services/firebaseService';


const Label: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1.5 ml-1">{children}</label>
);

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [state, setState] = useState<AppState>(getState());
  const [activeTab, setActiveTab] = useState<'monitor' | 'registry' | 'time' | 'attn' | 'leaves' | 'sec' | 'sys'>('monitor');
  const [isSyncing, setIsSyncing] = useState(false);
  const userRole = getRole();

  // Registry & Timetable States
  const [regMode, setRegMode] = useState<'staff' | 'subject' | 'class'>('staff');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [gridClassId, setGridClassId] = useState('');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  // Leave Form State
  const [leaveStaffId, setLeaveStaffId] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  // Persist state changes
  useEffect(() => {
    saveState(state);
    if (state.settings.cloudDbEnabled && state.settings.googleSheetWebAppUrl) {
      syncToCloud(state.settings.googleSheetWebAppUrl, state);
    }
  }, [state]);

  const addLog = (action: string) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      user: userRole === 'principal' ? 'Principal' : 'Admin',
      action
    };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 50) }));
  };

  // --- CUSTOM DIALOG STATES FOR FULL WEBVIEW/ANDROID IMMERSION ---
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotLabel, setSlotLabel] = useState('');
  const [slotStart, setSlotStart] = useState('16:00');
  const [slotEnd, setSlotEnd] = useState('16:50');
  const [slotIsBreak, setSlotIsBreak] = useState(false);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classNameVal, setClassNameVal] = useState('');
  const [classSection, setClassSection] = useState('');

  // Unified Confirmation and Alert Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {}
  });

  const triggerAlert = (title: string, message: string) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText: 'OK',
      cancelText: undefined,
      onConfirm: () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, confirmText = "Confirm", cancelText = "Cancel") => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      }
    });
  };

  // --- REGISTRY CRUD ---
  const addStaff = () => {
    setStaffName('');
    setIsStaffModalOpen(true);
  };

  const handleConfirmAddStaff = () => {
    if (!staffName.trim()) {
      triggerAlert("Validation Error", "Please provide a valid staff name.");
      return;
    }
    const name = staffName.trim();
    const newStaff: StaffMember = { id: 's' + Date.now(), name, email: name.toLowerCase().replace(/ /g, '.') + '@siddartha.edu', department: 'Pharmacy', specialization: [], assignedSubjects: [], isActive: true, availability: state.config.workingDays };
    setState(prev => ({ ...prev, staff: [...prev.staff, newStaff] }));
    addLog(`Registry: Added Staff Member [${name}]`);
    setIsStaffModalOpen(false);
  };

  const addSubject = () => {
    setSubjectName('');
    setSubjectCode('');
    setIsSubjectModalOpen(true);
  };

  const handleConfirmAddSubject = () => {
    if (!subjectName.trim() || !subjectCode.trim()) {
      triggerAlert("Validation Error", "Please provide a valid subject name and code.");
      return;
    }
    const name = subjectName.trim();
    const code = subjectCode.trim().toUpperCase();
    setState(prev => ({ ...prev, subjects: [...prev.subjects, { id: 'sub' + Date.now(), name, code, department: 'Pharmacy' }] }));
    addLog(`Registry: Added Subject [${name}]`);
    setIsSubjectModalOpen(false);
  };

  const addClass = () => {
    setClassNameVal('');
    setClassSection('');
    setIsClassModalOpen(true);
  };

  const handleConfirmAddClass = () => {
    if (!classNameVal.trim() || !classSection.trim()) {
      triggerAlert("Validation Error", "Please provide a valid class name and section.");
      return;
    }
    const name = classNameVal.trim();
    const section = classSection.trim().toUpperCase();
    setState(prev => ({ ...prev, classes: [...prev.classes, { id: 'c' + Date.now(), name, section }] }));
    addLog(`Registry: Added Class [${name}]`);
    setIsClassModalOpen(false);
  };

  const deleteItem = (type: 'staff' | 'subject' | 'class', id: string) => {
    const itemName = type === 'staff' 
      ? state.staff.find(i => i.id === id)?.name 
      : type === 'subject' 
        ? state.subjects.find(i => i.id === id)?.name 
        : state.classes.find(i => i.id === id)?.name;

    triggerConfirm(
      "Confirm Removal?",
      `Are you sure you want to permanently remove ${itemName || 'this record'} from the institutional database? This might affect existing timetables.`,
      () => {
        setState(prev => ({
          ...prev,
          staff: type === 'staff' ? prev.staff.filter(i => i.id !== id) : prev.staff,
          subjects: type === 'subject' ? prev.subjects.filter(i => i.id !== id) : prev.subjects,
          classes: type === 'class' ? prev.classes.filter(i => i.id !== id) : prev.classes,
        }));
        addLog(`Registry: Removed ${type} record`);
      }
    );
  };

  // --- ATTENDANCE ---
  const markAttendance = (staffId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const exists = state.attendance.some(a => a.staffId === staffId && a.date === today);
    if (exists) return;
    const record: AttendanceRecord = { id: Date.now().toString(), staffId, date: today, timestamp: new Date().toLocaleTimeString(), status: 'Present' };
    setState(prev => ({ ...prev, attendance: [...prev.attendance, record] }));
    addLog(`Attendance: Checked-in ${state.staff.find(s => s.id === staffId)?.name}`);
  };

  // --- LEAVES ---
  const handleLeaveApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStaffId || !leaveStart || !leaveEnd || !leaveReason) {
      triggerAlert("Validation Error", "All fields are required.");
      return;
    }
    const req: LeaveRequest = { id: 'L' + Date.now(), staffId: leaveStaffId, startDate: leaveStart, endDate: leaveEnd, reason: leaveReason, status: 'Pending', requestDate: new Date().toLocaleDateString() };
    setState(prev => ({ ...prev, leaves: [req, ...prev.leaves] }));
    addLog(`Leaves: New application for ${state.staff.find(s => s.id === leaveStaffId)?.name}`);
    setLeaveReason(''); 
    setLeaveStaffId(''); 
    triggerAlert("Submitted", "Leave request has been submitted for principal approval.");
  };

  // --- TIMETABLE ---
  const handleAssignSlot = (slotId: string, facultyId: string, subjectId: string) => {
    if (!gridClassId) return;
    const newEntry: TimetableEntry = { id: Date.now().toString(), day: selectedDay, slotId, classId: gridClassId, facultyId, subjectId, type: 'Lecture' };
    const tempEntries = [...state.timetable.filter(e => !(e.day === selectedDay && e.slotId === slotId && e.classId === gridClassId)), newEntry];
    const { conflicts } = detectConflicts(tempEntries);
    
    const saveAction = () => {
      setState(prev => ({ ...prev, timetable: tempEntries }));
      setEditingSlot(null);
      addLog(`Schedule: Updated ${selectedDay} grid`);
    };

    if (conflicts.length > 0) {
      triggerConfirm(
        "Institutional Conflict Detected",
        `${conflicts[0].description}. Do you want to force override this restriction and save anyway?`,
        saveAction
      );
    } else {
      saveAction();
    }
  };

  const clearSlot = (slotId: string) => {
    setState(prev => ({ ...prev, timetable: prev.timetable.filter(e => !(e.day === selectedDay && e.slotId === slotId && e.classId === gridClassId)) }));
  };

  // --- SECURITY & SYSTEM ---
  const updateSettings = (key: string, value: any) => setState(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));

  const handleTimeSlotChange = (id: string, field: 'start' | 'end' | 'label' | 'isBreak', value: any) => {
    setState(prev => {
      const updatedSlots = prev.config.timeSlots.map(slot => {
        if (slot.id === id) {
          return { ...slot, [field]: value };
        }
        return slot;
      });
      return {
        ...prev,
        config: {
          ...prev.config,
          timeSlots: updatedSlots
        }
      };
    });
    addLog(`System: Changed timing for slot [${id}]`);
  };

  const addTimeSlot = () => {
    setSlotLabel(`Period ${state.config.timeSlots.length + 1}`);
    setSlotStart('16:00');
    setSlotEnd('16:50');
    setSlotIsBreak(false);
    setIsSlotModalOpen(true);
  };

  const handleConfirmAddSlot = () => {
    if (!slotLabel.trim() || !slotStart.trim() || !slotEnd.trim()) {
      triggerAlert("Validation Error", "All slot fields are required.");
      return;
    }
    const newSlot = { 
      id: 'ts-' + Date.now(), 
      label: slotLabel.trim(), 
      start: slotStart.trim(), 
      end: slotEnd.trim(), 
      isBreak: slotIsBreak 
    };
    setState(prev => ({
      ...prev,
      config: { ...prev.config, timeSlots: [...prev.config.timeSlots, newSlot] }
    }));
    addLog(`System: Added custom time slot [${slotLabel}]`);
    setIsSlotModalOpen(false);
  };

  const deleteTimeSlot = (id: string) => {
    if (state.config.timeSlots.length <= 1) {
      triggerAlert("System Error", "The institutional timetable system requires at least one configured period slot.");
      return;
    }
    
    triggerConfirm(
      "Delete Time Slot?",
      "Are you sure you want to remove this period? Any lecture currently associated with this slot across the entire academy will become visually unmapped.",
      () => {
        setState(prev => ({
          ...prev,
          config: { ...prev.config, timeSlots: prev.config.timeSlots.filter(s => s.id !== id) }
        }));
        addLog(`System: Removed period slot ${id}`);
      }
    );
  };
  
  const handlePush = async () => {
    if (!state.settings.googleSheetWebAppUrl) {
      triggerAlert("Configuration Missing", "Apps Script Web App URL is not configured. Go to System tab to set it.");
      return;
    }
    setIsSyncing(true);
    const ok = await syncToCloud(state.settings.googleSheetWebAppUrl, state);
    setIsSyncing(false);
    if (ok) {
      triggerAlert("Cloud Hub Updated", "Institutional database has been safely synchronized and cached on the Cloud Google Sheets core.");
    } else {
      triggerAlert("Sync Error", "Failed to communicate with Google Sheets cloud backend. Check script settings and access level.");
    }
  };

  const handlePull = async () => {
    if (!state.settings.googleSheetWebAppUrl) {
      triggerAlert("Configuration Missing", "Apps Script Web App URL is not configured. Go to System tab to set it.");
      return;
    }
    
    triggerConfirm(
      "Synchronize and Overwrite Local Storage?",
      "This process will completely replace your current device's local database snapshot and reload the institutional records from the Cloud!",
      async () => {
        setIsSyncing(true);
        let recoveryActive = false;
        try {
          let data = null;
          try {
            data = await fetchFromCloud(state.settings.googleSheetWebAppUrl);
          } catch (sheetErr) {
            console.warn("Primary fetch exception, attempting Firestore...", sheetErr);
            data = await fetchStateFromFirestore();
            if (data) {
              recoveryActive = true;
              triggerAlert("Firestore Safety Recovery", "Google Sheet was unreachable, but we successfully loaded the latest safety database snapshot from Google Firestore!");
            }
          }

          if (data) { 
            setState(data); 
            saveState(data); 
            if (!recoveryActive) {
              triggerAlert("Instance Synchronized", "The device storage has been successfully refreshed with the latest central cloud records.");
            }
            setTimeout(() => {
              window.location.reload(); 
            }, 1800);
          } else {
            triggerAlert("Sync Empty", "No records found on the remote cloud sheet or Firebase safety backup.");
          }
        } catch (err: any) {
          triggerAlert("Connection Exception", "Communication with Cloud Core failed. Operating strictly in high-speed offline mode.");
        }
        setIsSyncing(false);
      }
    );
  };

  const menuItems = [
    { id: 'monitor', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'registry', icon: 'fa-address-book', label: 'Registry' },
    { id: 'time', icon: 'fa-calendar-check', label: 'Timetable' },
    { id: 'attn', icon: 'fa-clipboard-user', label: 'Attendance' },
    { id: 'leaves', icon: 'fa-calendar-day', label: 'Leaves' },
    { id: 'sec', icon: 'fa-shield-halved', label: 'Security', principalOnly: true },
    { id: 'sys', icon: 'fa-sliders', label: 'System', principalOnly: true }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
      {/* LEFT SIDEBAR MENU */}
      <aside className="lg:w-72 w-full shrink-0 lg:sticky lg:top-24">
        <div className="p-8 glass rounded-[2.5rem] border-emerald-100 shadow-xl text-center mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200">
            <i className={`fa-solid ${userRole === 'principal' ? 'fa-crown' : 'fa-user-shield'} text-2xl`}></i>
          </div>
          <h2 className="text-sm font-black text-emerald-900 uppercase tracking-tighter">{userRole} access</h2>
          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Institutional Core</p>
        </div>
        
        <nav className="space-y-2">
          {menuItems.filter(item => userRole === 'principal' || !item.principalOnly).map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-xl translate-x-1' : 'text-emerald-800 hover:bg-emerald-100/50'}`}
            >
              <i className={`fa-solid ${item.icon} w-6 text-lg`}></i>
              <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <div className="pt-8">
            <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
              <i className="fa-solid fa-power-off w-6 text-lg"></i>
              <span className="text-[10px] uppercase tracking-widest">Logout System</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* RIGHT CONTENT WINDOW */}
      <main className="flex-grow glass rounded-[3rem] p-10 min-h-[850px] border-emerald-100 shadow-2xl relative overflow-hidden flex flex-col w-full">
        
        {/* TAB: MONITOR */}
        {activeTab === 'monitor' && (
          <div className="space-y-10 animate-in fade-in fill-mode-both">
            <h3 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">System Monitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: 'Faculty Registry', v: state.staff.length, i: 'fa-users', c: 'emerald' },
                { l: 'Class Matrix', v: state.classes.length, i: 'fa-door-open', c: 'blue' },
                { l: 'Auth Pending', v: state.leaves.filter(l => l.status === 'Pending').length, i: 'fa-clock', c: 'amber' }
              ].map((s, i) => (
                <div key={i} className={`p-8 bg-${s.c}-50 rounded-3xl border border-${s.c}-100 shadow-sm transition-all hover:scale-[1.02]`}>
                  <Label>{s.l}</Label>
                  <div className="flex items-center justify-between">
                    <p className={`text-4xl font-black text-${s.c}-900`}>{s.v}</p>
                    <i className={`fa-solid ${s.i} text-${s.c}-200 text-3xl`}></i>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 flex-grow">
              <Label>Real-time Audit Stream</Label>
              <div className="bg-slate-50 rounded-[2.5rem] p-8 h-80 overflow-y-auto border border-slate-100 custom-scrollbar text-[11px] font-bold">
                {state.logs.map(log => (
                  <div key={log.id} className="flex justify-between items-center py-4 border-b border-slate-200 last:border-0">
                    <span className="text-slate-400 font-mono">{log.timestamp}</span>
                    <span className="text-emerald-900">{log.action}</span>
                    <span className="text-emerald-600 uppercase bg-emerald-100/50 px-2 py-0.5 rounded-md">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-8 animate-in fade-in fill-mode-both">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {['staff', 'subject', 'class'].map(m => (
                  <button key={m} onClick={() => setRegMode(m as any)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${regMode === m ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-600'}`}>{m}s</button>
                ))}
              </div>
              <button onClick={() => regMode === 'staff' ? addStaff() : regMode === 'subject' ? addSubject() : addClass()} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200">New {regMode} Record</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(regMode === 'staff' ? state.staff : regMode === 'subject' ? state.subjects : state.classes).map((item: any) => (
                <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                  <div>
                    <p className="text-sm font-black text-emerald-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.code || item.department || `Section ${item.section}`}</p>
                  </div>
                  <button onClick={() => deleteItem(regMode, item.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-200 hover:text-red-500 hover:bg-red-50 transition-all"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMETABLE */}
        {activeTab === 'time' && (
          <div className="space-y-8 animate-in fade-in fill-mode-both">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-grow">
                <Label>View Target Matrix</Label>
                <select value={gridClassId} onChange={e => setGridClassId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-emerald-900 focus:outline-emerald-500 shadow-inner">
                  <option value="">Choose Class Registry...</option>
                  {state.classes.map(c => <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>)}
                </select>
              </div>
              <div className="flex bg-slate-100 p-2 rounded-2xl overflow-x-auto max-w-full">
                {state.config.workingDays.map(d => (
                  <button key={d} onClick={() => setSelectedDay(d)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${selectedDay === d ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'}`}>{d.substring(0,3)}</button>
                ))}
              </div>
            </div>
            {gridClassId ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {state.config.timeSlots.map(slot => {
                  const entry = state.timetable.find(e => e.day === selectedDay && e.slotId === slot.id && e.classId === gridClassId);
                  if (slot.isBreak) return <div key={slot.id} className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center justify-center text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{slot.label}</div>;
                  return (
                    <div key={slot.id} onClick={() => setEditingSlot(slot.id)} className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer relative group ${entry ? 'bg-emerald-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'}`}>
                      <p className="text-[8px] font-black uppercase mb-1 opacity-50 tracking-widest">{slot.label}</p>
                      {entry ? (
                        <>
                          <p className="text-xs font-black leading-tight mb-1">{state.subjects.find(s => s.id === entry.subjectId)?.name}</p>
                          <p className="text-[9px] font-bold opacity-80 uppercase tracking-tight">{state.staff.find(s => s.id === entry.facultyId)?.name}</p>
                          <button onClick={(e) => { e.stopPropagation(); clearSlot(slot.id); }} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><i className="fa-solid fa-xmark"></i></button>
                        </>
                      ) : <p className="text-[9px] font-black text-slate-200">Available Slot</p>}
                      {editingSlot === slot.id && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/50 backdrop-blur-md p-4" onClick={e => {e.stopPropagation(); setEditingSlot(null);}}>
                          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <h4 className="text-xl font-black text-emerald-900 mb-8 uppercase tracking-tighter">Allocate {slot.label}</h4>
                            <div className="space-y-6 text-left">
                              <div><Label>Select Faculty</Label>
                                <select id={`f-${slot.id}`} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900">
                                  {state.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                              </div>
                              <div><Label>Select Subject</Label>
                                <select id={`s-${slot.id}`} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900">
                                  {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                              </div>
                              <button onClick={() => handleAssignSlot(slot.id, (document.getElementById(`f-${slot.id}`) as any).value, (document.getElementById(`s-${slot.id}`) as any).value)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all">Assign To Grid</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : <div className="flex-grow flex items-center justify-center border-4 border-dashed border-slate-50 rounded-[3rem] text-slate-200 font-black uppercase text-xs tracking-[0.3em] min-h-[400px]">Select Target to Display Matrix</div>}
          </div>
        )}

        {/* ATTENDANCE */}
        {activeTab === 'attn' && (
          <div className="space-y-10 animate-in fade-in fill-mode-both">
            <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Presence Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.staff.map(s => {
                const today = new Date().toISOString().split('T')[0];
                const marked = state.attendance.some(a => a.staffId === s.id && a.date === today);
                return (
                  <div key={s.id} className={`p-8 rounded-[2.5rem] border flex justify-between items-center transition-all ${marked ? 'bg-emerald-50 border-emerald-100 shadow-inner' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-100'}`}>
                    <div>
                      <p className="text-sm font-black text-emerald-900">{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.department}</p>
                    </div>
                    <button onClick={() => markAttendance(s.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${marked ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                      <i className={`fa-solid ${marked ? 'fa-check-double' : 'fa-check'}`}></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEAVES */}
        {activeTab === 'leaves' && (
          <div className="space-y-12 animate-in fade-in fill-mode-both">
            <div className="bg-white p-10 rounded-[3rem] border border-emerald-100 shadow-sm">
              <h4 className="text-sm font-black text-emerald-900 uppercase mb-8 tracking-widest">Absence Protocol</h4>
              <form onSubmit={handleLeaveApply} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div><Label>Applicant</Label>
                    <select value={leaveStaffId} onChange={e => setLeaveStaffId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 focus:outline-emerald-500">
                      <option value="">Select Faculty Identity...</option>
                      {state.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Start Date</Label><input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-emerald-900" /></div>
                    <div><Label>End Date</Label><input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-emerald-900" /></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div><Label>Justification</Label>
                    <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Provide context for this request..." className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-emerald-500 resize-none text-emerald-900 shadow-inner" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all">Transmit Application</button>
                </div>
              </form>
            </div>
            {userRole === 'principal' && (
              <div className="space-y-6">
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Auth Queue</h4>
                {state.leaves.filter(l => l.status === 'Pending').map(req => (
                  <div key={req.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                    <div className="flex-grow">
                      <p className="text-lg font-black text-emerald-900">{state.staff.find(s => s.id === req.staffId)?.name}</p>
                      <p className="text-xs font-bold text-slate-500 italic mb-2">"{req.reason}"</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{req.startDate} to {req.endDate}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => { setState(prev => ({ ...prev, leaves: prev.leaves.map(l => l.id === req.id ? {...l, status: 'Approved'} : l) })); addLog(`Approved leave: ${req.id}`); }} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-90 transition-transform">Accept</button>
                      <button onClick={() => { setState(prev => ({ ...prev, leaves: prev.leaves.map(l => l.id === req.id ? {...l, status: 'Rejected'} : l) })); addLog(`Rejected leave: ${req.id}`); }} className="px-6 py-3 bg-white border border-red-100 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECURITY (PRINCIPAL ONLY) */}
        {activeTab === 'sec' && userRole === 'principal' && (
          <div className="space-y-12 animate-in fade-in fill-mode-both">
            <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Access & Sync Center</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-white border border-emerald-100 rounded-[3rem] shadow-sm">
              <div className="space-y-6">
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Principal Credentials</h4>
                <div className="space-y-3"><Label>Username</Label><input type="text" value={state.settings.principalUsername} onChange={e => updateSettings('principalUsername', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 shadow-inner" /></div>
                <div className="space-y-3"><Label>Password</Label><input type="password" value={state.settings.principalPassword} onChange={e => updateSettings('principalPassword', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 shadow-inner" /></div>
              </div>
              <div className="space-y-6">
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Admin Credentials</h4>
                <div className="space-y-3"><Label>Username</Label><input type="text" value={state.settings.adminUsername} onChange={e => updateSettings('adminUsername', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 shadow-inner" /></div>
                <div className="space-y-3"><Label>Password</Label><input type="password" value={state.settings.adminPassword} onChange={e => updateSettings('adminPassword', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 shadow-inner" /></div>
              </div>
            </div>
            
            <div className="p-10 bg-white border border-emerald-100 rounded-[3rem] space-y-6 shadow-sm">
              <div className="flex justify-between items-center"><h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Google SSO Entry</h4>
                <button onClick={() => updateSettings('googleLoginEnabled', !state.settings.googleLoginEnabled)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${state.settings.googleLoginEnabled ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{state.settings.googleLoginEnabled ? 'Active' : 'Disabled'}</button>
              </div>
              {state.settings.googleLoginEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                  <div><Label>Google Client ID</Label><input type="text" value={state.settings.googleClientId} onChange={e => updateSettings('googleClientId', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono text-emerald-800" /></div>
                  <div><Label>Whitelisted Staff Emails</Label><input type="text" value={state.settings.approvedEmails.join(', ')} onChange={e => updateSettings('approvedEmails', e.target.value.split(',').map(s => s.trim()))} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono text-emerald-800" /></div>
                </div>
              )}
            </div>

            <div className="p-10 bg-white border border-emerald-100 rounded-[3rem] space-y-6 shadow-sm">
              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Global Persistence Bridge</h4>
              <Label>Google Sheets Apps Script URL</Label>
              <input type="text" value={state.settings.googleSheetWebAppUrl} onChange={e => updateSettings('googleSheetWebAppUrl', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-mono text-emerald-800 shadow-inner" />
              <div className="flex gap-4">
                <button onClick={handlePush} disabled={isSyncing} className="flex-grow py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all">Push Local Data</button>
                <button onClick={handlePull} disabled={isSyncing} className="flex-grow py-4 bg-white border border-emerald-100 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors">Pull Cloud Data</button>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM (PRINCIPAL ONLY) */}
        {activeTab === 'sys' && userRole === 'principal' && (
          <div className="space-y-12 animate-in fade-in fill-mode-both">
            <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Institutional Constants</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-white border border-emerald-100 rounded-[3rem] shadow-sm">
              <div className="space-y-6">
                <Label>Operational Days Signature</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button key={day} onClick={() => { const next = state.config.workingDays.includes(day) ? state.config.workingDays.filter(d => d !== day) : [...state.config.workingDays, day]; setState({...state, config: {...state.config, workingDays: next}}); }} className={`p-4 rounded-xl text-[9px] font-black uppercase transition-all border ${state.config.workingDays.includes(day) ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{day}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div><Label>Current Academic Year</Label><input type="text" value={state.config.academicYear} onChange={e => setState({...state, config: {...state.config, academicYear: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 shadow-inner" /></div>
                <div><Label>Active Enrollment Term</Label><input type="text" value={state.config.term} onChange={e => setState({...state, config: {...state.config, term: e.target.value}})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-emerald-900 shadow-inner" /></div>
              </div>
            </div>

            {/* Configured Period Bell Timings */}
            <div className="p-10 bg-white border border-emerald-100 rounded-[3rem] space-y-8 shadow-sm">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Period Bell Schedules</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Configure default daily lecture durations and breaks</p>
                </div>
                <button 
                  onClick={addTimeSlot} 
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                  Add Custom Slot
                </button>
              </div>

              <div className="space-y-4">
                {state.config.timeSlots.map((slot) => (
                  <div key={slot.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                    {/* Period Label */}
                    <div className="w-full md:w-1/4">
                      <Label>Slot Label</Label>
                      <input 
                        type="text" 
                        value={slot.label} 
                        onChange={(e) => handleTimeSlotChange(slot.id, 'label', e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                      />
                    </div>

                    {/* Start Time */}
                    <div className="w-full md:w-1/5">
                      <Label>Start Hour</Label>
                      <input 
                        type="text" 
                        value={slot.start} 
                        placeholder="HH:MM"
                        onChange={(e) => handleTimeSlotChange(slot.id, 'start', e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                      />
                    </div>

                    {/* End Time */}
                    <div className="w-full md:w-1/5">
                      <Label>End Hour</Label>
                      <input 
                        type="text" 
                        value={slot.end} 
                        placeholder="HH:MM"
                        onChange={(e) => handleTimeSlotChange(slot.id, 'end', e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                      />
                    </div>

                    {/* Break Switch & Delete */}
                    <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`break-${slot.id}`}
                          checked={slot.isBreak}
                          onChange={(e) => handleTimeSlotChange(slot.id, 'isBreak', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                        />
                        <label htmlFor={`break-${slot.id}`} className="text-[10px] font-black text-emerald-800 uppercase tracking-wider cursor-pointer select-none">Is Break</label>
                      </div>

                      <button 
                        onClick={() => deleteTimeSlot(slot.id)} 
                        disabled={state.config.timeSlots.length <= 1}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 disabled:opacity-40"
                        title="Delete slot"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== CUSTOM MODALS ==================== */}

      {/* 1. Time Slot Add Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Add Custom Period Slot</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure default daily lecture durations and breaks</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Slot Label</Label>
                <input 
                  type="text" 
                  value={slotLabel} 
                  onChange={e => setSlotLabel(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  placeholder="e.g. Period 7 or Recess"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <input 
                    type="text" 
                    value={slotStart} 
                    onChange={e => setSlotStart(e.target.value)} 
                    placeholder="HH:MM (24h)"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <input 
                    type="text" 
                    value={slotEnd} 
                    onChange={e => setSlotEnd(e.target.value)} 
                    placeholder="HH:MM (24h)"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="new-slot-break"
                  checked={slotIsBreak}
                  onChange={e => setSlotIsBreak(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="new-slot-break" className="text-xs font-black text-emerald-800 uppercase tracking-wider cursor-pointer select-none">Is Break / Lunch</label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleConfirmAddSlot}
                className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95 animate-pulse"
              >
                Add Period
              </button>
              <button 
                onClick={() => setIsSlotModalOpen(false)}
                className="py-4 px-6 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Staff Add Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Add Staff Member</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register new faculty scholar into central database</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Staff Name</Label>
                <input 
                  type="text" 
                  value={staffName} 
                  onChange={e => setStaffName(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  placeholder="e.g. Dr. Saravana Sai"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleConfirmAddStaff}
                className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                Register Staff
              </button>
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="py-4 px-6 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subject Add Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Register Subject</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assign curriculum syllabus modules to schedule</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Subject Title</Label>
                <input 
                  type="text" 
                  value={subjectName} 
                  onChange={e => setSubjectName(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  placeholder="e.g. Instrumental Analysis"
                />
              </div>
              <div>
                <Label>Subject Code</Label>
                <input 
                  type="text" 
                  value={subjectCode} 
                  onChange={e => setSubjectCode(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  placeholder="e.g. BP701T"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleConfirmAddSubject}
                className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                Add Subject
              </button>
              <button 
                onClick={() => setIsSubjectModalOpen(false)}
                className="py-4 px-6 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Class Add Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Create Classroom</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure academic batch enrollment targets</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Class / Year Description</Label>
                <input 
                  type="text" 
                  value={classNameVal} 
                  onChange={e => setClassNameVal(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  placeholder="e.g. B.Pharm Year 4"
                />
              </div>
              <div>
                <Label>Section / Stream Signature</Label>
                <input 
                  type="text" 
                  value={classSection} 
                  onChange={e => setClassSection(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-emerald-950 focus:outline-emerald-500 shadow-inner"
                  placeholder="e.g. B"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleConfirmAddClass}
                className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                Add Class
              </button>
              <button 
                onClick={() => setIsClassModalOpen(false)}
                className="py-4 px-6 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Unified Alert & Confirmation Dialog */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter text-left">{confirmConfig.title}</h3>
              <p className="text-xs text-slate-500 font-bold mt-3 leading-relaxed uppercase tracking-wider text-left">{confirmConfig.message}</p>
            </div>

            <div className="flex gap-4 pt-2 w-full">
              <button 
                onClick={confirmConfig.onConfirm}
                className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                {confirmConfig.confirmText || 'Confirm'}
              </button>
              {confirmConfig.cancelText && (
                <button 
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="py-4 px-6 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  {confirmConfig.cancelText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
