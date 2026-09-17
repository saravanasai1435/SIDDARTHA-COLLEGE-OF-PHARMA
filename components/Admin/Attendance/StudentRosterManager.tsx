import React, { useState, useMemo, useRef } from 'react';
import { AppState, ClassRoom, Student } from '../../../types';
import { parseStudentCSV, parseStudentDocumentOrPDFText, generateStudentCSVTemplate, generateDefaultStudents } from '../../../services/attendanceService';

interface StudentRosterManagerProps {
  appState: AppState;
  onUpdateStudents: (updatedStudents: Student[], logMessage: string) => void;
  triggerAlert: (title: string, message: string) => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

export const StudentRosterManager: React.FC<StudentRosterManagerProps> = ({
  appState,
  onUpdateStudents,
  triggerAlert,
  triggerConfirm
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Manual Add Form
  const [newRoll, setNewRoll] = useState('');
  const [newName, setNewName] = useState('');
  const [newAdm, setNewAdm] = useState('');
  const [newClassId, setNewClassId] = useState<string>(appState.classes[0]?.id || '');

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    validStudents: Student[];
    errors: string[];
    totalRows: number;
  } | null>(null);

  // PDF / Document Roster State
  const [pdfRawText, setPdfRawText] = useState<string>('');
  const [pdfTargetClassId, setPdfTargetClassId] = useState<string>(appState.classes[0]?.id || '');
  const [pdfParseResult, setPdfParseResult] = useState<{
    validStudents: Student[];
    errors: string[];
    totalLines: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const students = appState.students || [];

  // Filtered student list
  const displayedStudents = useMemo(() => {
    return students.filter(st => {
      const matchClass = selectedClassId === 'ALL' || st.classId === selectedClassId;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        st.name.toLowerCase().includes(q) ||
        st.rollNumber.toLowerCase().includes(q) ||
        (st.admissionNumber && st.admissionNumber.toLowerCase().includes(q));
      return matchClass && matchQuery;
    });
  }, [students, selectedClassId, searchQuery]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvRawText(text);
      // Run validation parser
      const result = parseStudentCSV(text, appState.classes, students);
      setParseResult(result);
    };
    reader.readAsText(file);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const csv = generateStudentCSVTemplate(appState.classes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kvsr_student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Commit CSV import
  const handleCommitImport = () => {
    if (!parseResult || parseResult.validStudents.length === 0) {
      triggerAlert('Import Error', 'No valid student records found to import.');
      return;
    }

    // Merge logic: match rule (Class + Roll Number) = unique key
    const currentList = [...students];
    let inserted = 0;
    let updated = 0;

    parseResult.validStudents.forEach(incoming => {
      const existingIdx = currentList.findIndex(
        s => s.classId === incoming.classId && s.rollNumber.toUpperCase() === incoming.rollNumber.toUpperCase()
      );
      if (existingIdx !== -1) {
        currentList[existingIdx] = {
          ...currentList[existingIdx],
          name: incoming.name,
          admissionNumber: incoming.admissionNumber || currentList[existingIdx].admissionNumber
        };
        updated++;
      } else {
        currentList.push(incoming);
        inserted++;
      }
    });

    onUpdateStudents(
      currentList,
      `Excel/CSV Roster Import: Inserted ${inserted} new students, updated ${updated} existing records.`
    );

    setIsImportModalOpen(false);
    setCsvFile(null);
    setCsvRawText('');
    setParseResult(null);

    triggerAlert(
      'Import Completed',
      `Successfully processed student roster!\n\n• ${inserted} New Students Inserted\n• ${updated} Existing Records Updated`
    );
  };

  // PDF / Document Roster Handlers
  const handlePdfTextChange = (text: string, classId: string = pdfTargetClassId) => {
    setPdfRawText(text);
    if (!text.trim()) {
      setPdfParseResult(null);
      return;
    }
    const result = parseStudentDocumentOrPDFText(text, classId, appState.classes, students);
    setPdfParseResult(result);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      handlePdfTextChange(text, pdfTargetClassId);
    };
    reader.readAsText(file);
  };

  const handleCommitPdfImport = () => {
    if (!pdfParseResult || pdfParseResult.validStudents.length === 0) {
      triggerAlert('Import Error', 'No valid student roll numbers and names were detected.');
      return;
    }

    const currentList = [...students];
    let inserted = 0;
    let updated = 0;

    pdfParseResult.validStudents.forEach(incoming => {
      const existingIdx = currentList.findIndex(
        s => s.classId === incoming.classId && s.rollNumber.toUpperCase() === incoming.rollNumber.toUpperCase()
      );
      if (existingIdx !== -1) {
        currentList[existingIdx] = {
          ...currentList[existingIdx],
          name: incoming.name,
          admissionNumber: incoming.admissionNumber || currentList[existingIdx].admissionNumber
        };
        updated++;
      } else {
        currentList.push(incoming);
        inserted++;
      }
    });

    onUpdateStudents(
      currentList,
      `PDF/Document Roster Import: Added ${inserted} students, updated ${updated} records.`
    );

    setIsPdfModalOpen(false);
    setPdfRawText('');
    setPdfParseResult(null);

    triggerAlert(
      'PDF Roster Processed',
      `Successfully imported student roster!\n\n• ${inserted} New Students Inserted\n• ${updated} Existing Records Updated`
    );
  };

  // Seed default 12-class rosters
  const handleSeedDefaultRosters = () => {
    triggerConfirm(
      'Seed Sample Student Rosters',
      'Generate 240+ authentic student rosters across all 12 classes (B. Pharm I-IV & Pharm. D I-V)?\n\nExisting students will be preserved and merged.',
      () => {
        const defaultList = generateDefaultStudents(appState.classes);
        const currentList = [...students];
        let added = 0;

        defaultList.forEach(def => {
          const exists = currentList.some(
            s => s.classId === def.classId && s.rollNumber.toUpperCase() === def.rollNumber.toUpperCase()
          );
          if (!exists) {
            currentList.push(def);
            added++;
          }
        });

        onUpdateStudents(
          currentList,
          `Roster Seed: Initialized ${added} student records for all classes.`
        );

        triggerAlert('Rosters Seeded', `Successfully synchronized student rosters for all classes (${added} records processed).`);
      }
    );
  };

  // Add single student manual form
  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoll.trim() || !newName.trim() || !newClassId) {
      triggerAlert('Validation Error', 'Roll number, student name, and class are all mandatory.');
      return;
    }

    const roll = newRoll.trim().toUpperCase();
    const exists = students.some(
      s => s.classId === newClassId && s.rollNumber.toUpperCase() === roll
    );

    if (exists) {
      triggerAlert('Duplicate Entry', `A student with roll number [${roll}] is already registered in this class.`);
      return;
    }

    const newStudent: Student = {
      id: `std-${newClassId}-${roll.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36)}`,
      classId: newClassId,
      rollNumber: roll,
      name: newName.trim(),
      admissionNumber: newAdm.trim() || `ADM-${roll}`
    };

    const updated = [...students, newStudent];
    onUpdateStudents(updated, `Manual Student Enrolled: [${roll}] ${newName.trim()}`);

    setIsAddModalOpen(false);
    setNewRoll('');
    setNewName('');
    setNewAdm('');
  };

  // Delete student
  const handleDeleteStudent = (student: Student) => {
    triggerConfirm(
      'Remove Student',
      `Are you sure you want to remove student [${student.rollNumber}] ${student.name}?`,
      () => {
        const filtered = students.filter(s => s.id !== student.id);
        onUpdateStudents(filtered, `Removed student: [${student.rollNumber}] ${student.name}`);
      }
    );
  };

  // Remove all students
  const handleRemoveAllStudents = () => {
    triggerConfirm(
      'Remove All Students',
      `Are you sure you want to completely remove all ${students.length} student records from the institutional directory?\n\nThis will clear all registered students and their attendance entries across all classes. You can re-import from CSV/Excel or PDF at any time.`,
      () => {
        onUpdateStudents([], 'All student records removed from institutional directory.');
        triggerAlert('Students Removed', 'All student records have been cleared from the directory.');
      },
      'Yes, Remove All',
      'Cancel'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in fill-mode-both">
      {/* Action Banner */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight">
              Class Roster & Student Directory
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage student enrollments, upload batch Excel/CSV rosters, and map Roll Numbers to institutional classes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-file-arrow-down text-emerald-700"></i> Sample CSV
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-file-excel text-emerald-600"></i> Import Excel / CSV
          </button>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-file-pdf text-rose-600"></i> Import PDF / Text Roster
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i> Add Student
          </button>

          {students.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveAllStudents}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-rose-200 active:scale-95 transition-all flex items-center gap-2"
              title="Completely remove all student records"
            >
              <i className="fa-solid fa-trash-can"></i> Remove All Students
            </button>
          )}

          {students.length < 50 && (
            <button
              type="button"
              onClick={handleSeedDefaultRosters}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-amber-600"></i> Seed 12 Classes
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Class Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
            Filter Class:
          </label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Registered Classes ({students.length} Students)</option>
            {appState.classes.map(c => {
              const classCount = students.filter(s => s.classId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(Sec ${c.section})` : ''} - {classCount} students
                </option>
              );
            })}
          </select>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by Roll No, Name, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Enrolled Students ({displayedStudents.length})
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            Unique Key: Class + Roll Number
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto text-2xl">
              <i className="fa-solid fa-user-slash"></i>
            </div>
            <div>
              <h4 className="text-base font-black text-slate-800 uppercase tracking-wide">
                No Students in Directory
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                All student records have been cleared. You can add individual students, upload an Excel/CSV file, or paste text/PDF rosters above.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-file-excel text-emerald-600"></i> Import Excel / CSV
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-user-plus"></i> Add Student
              </button>
            </div>
          </div>
        ) : displayedStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">
            No students match your filter or search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30">
                  <th className="p-4 pl-6">Roll Number</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Academic Class</th>
                  <th className="p-4">Admission ID</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedStudents.map((st) => {
                  const cls = appState.classes.find(c => c.id === st.classId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <span className="font-mono font-black text-emerald-950 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                          {st.rollNumber}
                        </span>
                      </td>
                      <td className="p-4 font-black text-emerald-950">
                        {st.name}
                      </td>
                      <td className="p-4 font-semibold text-slate-600">
                        {cls ? `${cls.name} (${cls.section})` : st.classId}
                        <span className="text-[10px] text-slate-400 block">{cls?.program}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-500">
                        {st.admissionNumber || '—'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(st)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors inline-flex items-center justify-center"
                          title="Remove student"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
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

      {/* CSV / Excel Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                  <i className="fa-solid fa-file-excel"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
                    Import Excel / CSV Roster
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    Match Rule: <strong>(Class + Roll Number)</strong> = Unique Key for Insert/Update
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParseResult(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-3xl bg-emerald-50/30 text-center cursor-pointer transition-colors space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                {csvFile ? csvFile.name : 'Click to select CSV File (or Drag & Drop)'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Columns required: <strong>Class, Roll Number, Name</strong> (Optional: <strong>Admission Number</strong>)
              </p>
            </div>

            {/* Validation Results Preview */}
            {parseResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black">
                    ✓ {parseResult.validStudents.length} Valid Rows
                  </span>
                  {parseResult.errors.length > 0 && (
                    <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 text-xs font-black">
                      ✗ {parseResult.errors.length} Rejected Rows
                    </span>
                  )}
                </div>

                {/* Errors Display */}
                {parseResult.errors.length > 0 && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 max-h-40 overflow-y-auto">
                    <p className="text-xs font-black text-rose-900 uppercase tracking-wider">
                      Validation Rejections (Not Committed):
                    </p>
                    {parseResult.errors.map((err, idx) => (
                      <p key={idx} className="text-[11px] text-rose-800 font-medium">
                        &bull; {err}
                      </p>
                    ))}
                  </div>
                )}

                {/* Valid Preview Table */}
                {parseResult.validStudents.length > 0 && (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="p-2.5 pl-4">Class</th>
                          <th className="p-2.5">Roll No</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5 pr-4">Admission ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.validStudents.slice(0, 10).map((s, idx) => {
                          const cls = appState.classes.find(c => c.id === s.classId);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2.5 pl-4 font-bold text-emerald-900">{cls?.name || s.classId}</td>
                              <td className="p-2.5 font-mono font-bold text-slate-800">{s.rollNumber}</td>
                              <td className="p-2.5 font-semibold text-slate-700">{s.name}</td>
                              <td className="p-2.5 pr-4 text-slate-400 font-mono">{s.admissionNumber || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {parseResult.validStudents.length > 10 && (
                      <div className="p-2 bg-slate-50 text-center text-[10px] font-bold text-slate-400">
                        + {parseResult.validStudents.length - 10} more rows ready to commit
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParseResult(null);
                }}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!parseResult || parseResult.validStudents.length === 0}
                onClick={handleCommitImport}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all"
              >
                Commit Import ({parseResult?.validStudents.length || 0} Students)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Single Student Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleAddSingleStudent} className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
                  Enroll Student
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Add an individual student to an institutional class.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5">
                Class Assignment
              </label>
              <select
                value={newClassId}
                onChange={e => setNewClassId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {appState.classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `(${c.section})` : ''} - {c.program}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5">
                Roll Number (Unique in Class)
              </label>
              <input
                type="text"
                placeholder="e.g. 24PH0101"
                value={newRoll}
                onChange={e => setNewRoll(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5">
                Full Student Name
              </label>
              <input
                type="text"
                placeholder="e.g. A. Sai Sneha"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5">
                Admission / Registration Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. KVSR-2024-001"
                value={newAdm}
                onChange={e => setNewAdm(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all"
              >
                Save Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PDF / Document Roster Import Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] border border-rose-100 p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-file-pdf"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-950 uppercase tracking-tight">
                    Import Student Names & Roll Number PDF / List
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    Paste extracted text from your PDF roster or select a document file.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPdfModalOpen(false);
                  setPdfParseResult(null);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Target Class Selection */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1.5">
                Target Class (If class is not specified in document header)
              </label>
              <select
                value={pdfTargetClassId}
                onChange={e => {
                  setPdfTargetClassId(e.target.value);
                  if (pdfRawText) handlePdfTextChange(pdfRawText, e.target.value);
                }}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {appState.classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `(${c.section})` : ''} — {c.program}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload or Paste */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900">
                  Paste Text from PDF / Document
                </label>
                <div>
                  <input
                    ref={pdfFileInputRef}
                    type="file"
                    accept=".txt,.csv,.doc,.pdf"
                    onChange={handlePdfFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfFileInputRef.current?.click()}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-upload"></i> Or Upload Text/Document File
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                value={pdfRawText}
                onChange={e => handlePdfTextChange(e.target.value, pdfTargetClassId)}
                placeholder={`Paste copied text directly from PDF or document. Formats supported:\n1  24PH0101  CHUNDURU SARAVANA SAI\n2  24PH0102  A. SAI SNEHA\n24PD0105 \t K. PRIYANKA\n1 | 24PH0103 | D. RAHUL`}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-emerald-950 focus:ring-2 focus:ring-rose-400 focus:outline-none placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The smart parser automatically strips serial numbers and extracts roll numbers (e.g. 24PH..., 24PD...) and student names.
              </p>
            </div>

            {/* Live Preview Result */}
            {pdfParseResult && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                    <i className="fa-solid fa-circle-check text-rose-600"></i>
                    <span>{pdfParseResult.validStudents.length} Valid Student Records Identified</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg">
                    {pdfParseResult.totalLines} lines scanned
                  </span>
                </div>

                {pdfParseResult.errors.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1 max-h-24 overflow-y-auto">
                    <p className="font-bold text-[10px] uppercase tracking-wider text-amber-800">Warnings / Skipped Lines:</p>
                    {pdfParseResult.errors.map((err, idx) => (
                      <p key={idx} className="text-[11px] font-mono">• {err}</p>
                    ))}
                  </div>
                )}

                {pdfParseResult.validStudents.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto shadow-inner">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="p-2.5 pl-4">Class</th>
                          <th className="p-2.5">Roll No</th>
                          <th className="p-2.5">Extracted Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pdfParseResult.validStudents.slice(0, 15).map((s, idx) => {
                          const cls = appState.classes.find(c => c.id === s.classId);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2 pl-4 font-bold text-emerald-900">{cls?.name || s.classId}</td>
                              <td className="p-2 font-mono font-black text-rose-900">{s.rollNumber}</td>
                              <td className="p-2 font-semibold text-slate-800">{s.name}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {pdfParseResult.validStudents.length > 15 && (
                      <div className="p-2 bg-slate-50 text-center text-[10px] font-bold text-slate-500">
                        + {pdfParseResult.validStudents.length - 15} additional students recognized
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsPdfModalOpen(false);
                  setPdfParseResult(null);
                  setPdfRawText('');
                }}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pdfParseResult || pdfParseResult.validStudents.length === 0}
                onClick={handleCommitPdfImport}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-all"
              >
                Commit Roster ({pdfParseResult?.validStudents.length || 0} Students)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
