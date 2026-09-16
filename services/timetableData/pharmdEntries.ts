import { TimetableEntry } from '../../types';

let idCounter = 1;
const e = (
  day: string,
  slotId: string,
  subjectId: string,
  facultyId: string,
  classId: string,
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Clinical' = 'Lecture',
  batch?: string,
  roomOrLab?: string
): TimetableEntry => ({
  id: `tt-pd-${idCounter++}`,
  day,
  slotId,
  subjectId,
  facultyId,
  classId,
  type,
  batch,
  roomOrLab,
  isLocked: true
});

export const PHARMD_ENTRIES: TimetableEntry[] = [
  // ==========================================
  // I/VI PHARM. D (c-pharmd-1)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-ph', 'staff-krs', 'c-pharmd-1'),
  e('Monday', 'slot-2', 'sub-pic', 'staff-chp', 'c-pharmd-1'),
  e('Monday', 'slot-3', 'sub-hap', 'staff-chnb', 'c-pharmd-1'),
  e('Monday', 'slot-4', 'sub-poc', 'staff-vn', 'c-pharmd-1', 'Lecture', undefined, 'Tutorial POC (Dr.VN)'),
  e('Monday', 'slot-5', 'sub-pic', 'staff-chp', 'c-pharmd-1', 'Lab', undefined, 'PIC Lab (Ms.CH.P)'),
  e('Monday', 'slot-6', 'sub-pic', 'staff-chp', 'c-pharmd-1', 'Lab', undefined, 'PIC Lab (Ms.CH.P)'),
  e('Monday', 'slot-7', 'sub-pic', 'staff-chp', 'c-pharmd-1', 'Lab', undefined, 'PIC Lab (Ms.CH.P)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-poc', 'staff-vn', 'c-pharmd-1'),
  e('Tuesday', 'slot-2', 'sub-biochem', 'staff-skab', 'c-pharmd-1', 'Lecture', undefined, 'Tutorial Biochem (Smt. Sk.AB)'),
  e('Tuesday', 'slot-3', 'sub-math-bio', 'staff-mvr', 'c-pharmd-1'),
  e('Tuesday', 'slot-4', 'sub-ph', 'staff-krs', 'c-pharmd-1', 'Lecture', undefined, 'Tutorial PH (Dr.KRS)'),
  e('Tuesday', 'slot-5', 'sub-ph', 'staff-krs', 'c-pharmd-1', 'Lab', undefined, 'PH Lab (Dr.KRS)'),
  e('Tuesday', 'slot-6', 'sub-ph', 'staff-krs', 'c-pharmd-1', 'Lab', undefined, 'PH Lab (Dr.KRS)'),
  e('Tuesday', 'slot-7', 'sub-ph', 'staff-krs', 'c-pharmd-1', 'Lab', undefined, 'PH Lab (Dr.KRS)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-ph', 'staff-kak', 'c-pharmd-1'),
  e('Wednesday', 'slot-2', 'sub-hap', 'staff-bnr', 'c-pharmd-1'),
  e('Wednesday', 'slot-3', 'sub-pic', 'staff-chp', 'c-pharmd-1', 'Lecture', undefined, 'Tutorial PIC (Ms.CHP)'),
  e('Wednesday', 'slot-4', 'sub-math-bio', 'staff-mvr', 'c-pharmd-1'),
  e('Wednesday', 'slot-5', 'sub-biochem', 'staff-mp', 'c-pharmd-1', 'Lab', undefined, 'Biochem LAB (Mr. MP)'),
  e('Wednesday', 'slot-6', 'sub-biochem', 'staff-mp', 'c-pharmd-1', 'Lab', undefined, 'Biochem LAB (Mr. MP)'),
  e('Wednesday', 'slot-7', 'sub-biochem', 'staff-mp', 'c-pharmd-1', 'Lab', undefined, 'Biochem LAB (Mr. MP)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-biochem', 'staff-mp', 'c-pharmd-1'),
  e('Thursday', 'slot-2', 'sub-poc', 'staff-tsd', 'c-pharmd-1'),
  e('Thursday', 'slot-3', 'sub-hap', 'staff-bnr', 'c-pharmd-1'),
  e('Thursday', 'slot-4', 'sub-math-bio', 'staff-mvr', 'c-pharmd-1'),
  e('Thursday', 'slot-5', 'sub-poc', 'staff-tsd', 'c-pharmd-1', 'Lab', undefined, 'POC LAB (Dr.TSD)'),
  e('Thursday', 'slot-6', 'sub-poc', 'staff-tsd', 'c-pharmd-1', 'Lab', undefined, 'POC LAB (Dr.TSD)'),
  e('Thursday', 'slot-7', 'sub-poc', 'staff-tsd', 'c-pharmd-1', 'Lab', undefined, 'POC LAB (Dr.TSD)'),

  // Friday
  e('Friday', 'slot-1', 'sub-biochem', 'staff-skab', 'c-pharmd-1'),
  e('Friday', 'slot-2', 'sub-lib', 'staff-chnb', 'c-pharmd-1'),
  e('Friday', 'slot-3', 'sub-math-bio', 'staff-mvr', 'c-pharmd-1'),
  e('Friday', 'slot-4', 'sub-hap', 'staff-chnb', 'c-pharmd-1'),
  e('Friday', 'slot-5', 'sub-hap', 'staff-bnr', 'c-pharmd-1', 'Lab', undefined, 'HAP LAB (Dr.BNR)'),
  e('Friday', 'slot-6', 'sub-hap', 'staff-bnr', 'c-pharmd-1', 'Lab', undefined, 'HAP LAB (Dr.BNR)'),
  e('Friday', 'slot-7', 'sub-hap', 'staff-bnr', 'c-pharmd-1', 'Lab', undefined, 'HAP LAB (Dr.BNR)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-biochem', 'staff-mp', 'c-pharmd-1'),
  e('Saturday', 'sat-2', 'sub-poc', 'staff-tsd', 'c-pharmd-1'),
  e('Saturday', 'sat-3', 'sub-pic', 'staff-chp', 'c-pharmd-1'),
  e('Saturday', 'sat-4', 'sub-sports', 'staff-mp', 'c-pharmd-1'),
  e('Saturday', 'sat-5', 'sub-sports', 'staff-mp', 'c-pharmd-1'),
  e('Saturday', 'sat-6', 'sub-sports', 'staff-mp', 'c-pharmd-1'),

  // ==========================================
  // II/VI PHARM. D (c-pharmd-2)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-pcol-1', 'staff-ghs', 'c-pharmd-2'),
  e('Monday', 'slot-2', 'sub-pt-1', 'staff-gvk', 'c-pharmd-2'),
  e('Monday', 'slot-3', 'sub-ppp', 'staff-ps', 'c-pharmd-2'),
  e('Monday', 'slot-4', 'sub-patho', 'staff-alp', 'c-pharmd-2'),
  e('Monday', 'slot-5', 'sub-ppp', 'staff-ps', 'c-pharmd-2', 'Lecture', undefined, 'Tutorial PPP (Dr.PS)'),
  e('Monday', 'slot-6', 'sub-act', 'staff-alp', 'c-pharmd-2', 'Seminar', undefined, 'Mentoring'),
  e('Monday', 'slot-7', 'sub-pt-1', 'staff-gvk', 'c-pharmd-2', 'Lecture', undefined, 'Tutorial PT-I (Dr.GVK)'),
  e('Monday', 'slot-8', 'sub-case-pres', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Case Presentations (Dr. ALP)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-ppp', 'staff-ps', 'c-pharmd-2'),
  e('Tuesday', 'slot-2', 'sub-pt-1', 'staff-alp', 'c-pharmd-2'),
  e('Tuesday', 'slot-3', 'sub-pm', 'staff-nkd', 'c-pharmd-2'),
  e('Tuesday', 'slot-4', 'sub-cp', 'staff-alp', 'c-pharmd-2', 'Lecture', undefined, 'Tutorial CP (Smt.ALP)'),
  e('Tuesday', 'slot-5', 'sub-pm', 'staff-ku', 'c-pharmd-2'),
  e('Tuesday', 'slot-6', 'sub-pcol-1', 'staff-ghs', 'c-pharmd-2', 'Lecture', undefined, 'Tutorial P. Col-I (Smt GHS)'),
  e('Tuesday', 'slot-7', 'sub-sports', 'staff-alp', 'c-pharmd-2'),
  e('Tuesday', 'slot-8', 'sub-sports', 'staff-alp', 'c-pharmd-2'),

  // Wednesday (Ward Rounds)
  e('Wednesday', 'slot-1', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),
  e('Wednesday', 'slot-2', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),
  e('Wednesday', 'slot-3', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),
  e('Wednesday', 'slot-4', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),
  e('Wednesday', 'slot-5', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),
  e('Wednesday', 'slot-6', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),
  e('Wednesday', 'slot-7', 'sub-ward', 'staff-alp', 'c-pharmd-2', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Smt.ALP)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-cp', 'staff-alp', 'c-pharmd-2'),
  e('Thursday', 'slot-2', 'sub-ppp', 'staff-vk', 'c-pharmd-2'),
  e('Thursday', 'slot-3', 'sub-pt-1', 'staff-gvk', 'c-pharmd-2'),
  e('Thursday', 'slot-4', 'sub-patho', 'staff-ks', 'c-pharmd-2', 'Lecture', undefined, 'Tutorial PP (Dr.KS)'),
  e('Thursday', 'slot-5', 'sub-ppp', 'staff-ps', 'c-pharmd-2', 'Lab', undefined, 'PPP Lab (Dr.PS)'),
  e('Thursday', 'slot-6', 'sub-ppp', 'staff-ps', 'c-pharmd-2', 'Lab', undefined, 'PPP Lab (Dr.PS)'),
  e('Thursday', 'slot-7', 'sub-ppp', 'staff-ps', 'c-pharmd-2', 'Lab', undefined, 'PPP Lab (Dr.PS)'),

  // Friday
  e('Friday', 'slot-1', 'sub-cp', 'staff-alp', 'c-pharmd-2'),
  e('Friday', 'slot-2', 'sub-pcol-1', 'staff-bnr', 'c-pharmd-2'),
  e('Friday', 'slot-3', 'sub-patho', 'staff-alp', 'c-pharmd-2'),
  e('Friday', 'slot-4', 'sub-patho', 'staff-ks', 'c-pharmd-2'),
  e('Friday', 'slot-5', 'sub-pm', 'staff-nkd', 'c-pharmd-2', 'Lab', undefined, 'PM Lab (Dr.NKD)'),
  e('Friday', 'slot-6', 'sub-pm', 'staff-nkd', 'c-pharmd-2', 'Lab', undefined, 'PM Lab (Dr.NKD)'),
  e('Friday', 'slot-7', 'sub-pm', 'staff-nkd', 'c-pharmd-2', 'Lab', undefined, 'PM Lab (Dr.NKD)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-pm', 'staff-ku', 'c-pharmd-2', 'Lecture', undefined, 'Tutorial PM (Dr.KU)'),
  e('Saturday', 'sat-2', 'sub-pcol-1', 'staff-bnr', 'c-pharmd-2'),
  e('Saturday', 'sat-3', 'sub-pm', 'staff-nkd', 'c-pharmd-2'),
  e('Saturday', 'sat-4', 'sub-lib', 'staff-alp', 'c-pharmd-2'),
  e('Saturday', 'sat-5', 'sub-lib', 'staff-alp', 'c-pharmd-2'),
  e('Saturday', 'sat-6', 'sub-lib', 'staff-alp', 'c-pharmd-2'),

  // ==========================================
  // III/VI PHARM. D (c-pharmd-3)
  // ==========================================
  // Monday (Ward Rounds)
  e('Monday', 'slot-1', 'sub-ward', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Dr. KS)'),
  e('Monday', 'slot-2', 'sub-ward', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Dr. KS)'),
  e('Monday', 'slot-3', 'sub-ward', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Dr. KS)'),
  e('Monday', 'slot-4', 'sub-ward', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Dr. KS)'),
  e('Monday', 'slot-5', 'sub-ward', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Dr. KS)'),
  e('Monday', 'slot-6', 'sub-ward', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - PT-II (Dr. KS)'),
  e('Monday', 'slot-7', 'sub-sports', 'staff-ks', 'c-pharmd-3'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-pa', 'staff-mvl', 'c-pharmd-3'),
  e('Tuesday', 'slot-2', 'sub-pcol-2', 'staff-cs', 'c-pharmd-3'),
  e('Tuesday', 'slot-3', 'sub-pj', 'staff-kak', 'c-pharmd-3'),
  e('Tuesday', 'slot-4', 'sub-pf', 'staff-skab', 'c-pharmd-3'),
  e('Tuesday', 'slot-5', 'sub-lib', 'staff-ks', 'c-pharmd-3'),
  e('Tuesday', 'slot-6', 'sub-pcol-2', 'staff-tvs', 'c-pharmd-3', 'Lecture', undefined, 'Tutorial P. Col-II (Dr.TVS)'),
  e('Tuesday', 'slot-7', 'sub-act', 'staff-ks', 'c-pharmd-3', 'Seminar', undefined, 'Mentoring'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-pf', 'staff-gr', 'c-pharmd-3'),
  e('Wednesday', 'slot-2', 'sub-pt-2', 'staff-ks', 'c-pharmd-3'),
  e('Wednesday', 'slot-3', 'sub-mc', 'staff-ba', 'c-pharmd-3'),
  e('Wednesday', 'slot-4', 'sub-pt-2', 'staff-ks', 'c-pharmd-3', 'Lecture', undefined, 'Tutorial PT-II (Dr. KS)'),
  e('Wednesday', 'slot-5', 'sub-pcol-2', 'staff-tvs', 'c-pharmd-3', 'Lab', undefined, 'P. Col-II Lab (Dr. TVS)'),
  e('Wednesday', 'slot-6', 'sub-pcol-2', 'staff-tvs', 'c-pharmd-3', 'Lab', undefined, 'P. Col-II Lab (Dr. TVS)'),
  e('Wednesday', 'slot-7', 'sub-pcol-2', 'staff-tvs', 'c-pharmd-3', 'Lab', undefined, 'P. Col-II Lab (Dr. TVS)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-pa', 'staff-mvl', 'c-pharmd-3'),
  e('Thursday', 'slot-2', 'sub-pt-2', 'staff-ks', 'c-pharmd-3'),
  e('Thursday', 'slot-3', 'sub-mc', 'staff-ba', 'c-pharmd-3'),
  e('Thursday', 'slot-4', 'sub-pf', 'staff-skab', 'c-pharmd-3', 'Lecture', undefined, 'Tutorial PF (Dr. Sk. AB)'),
  e('Thursday', 'slot-5', 'sub-mc', 'staff-ba', 'c-pharmd-3', 'Lab', undefined, 'MC Lab (Dr.BA)'),
  e('Thursday', 'slot-6', 'sub-mc', 'staff-ba', 'c-pharmd-3', 'Lab', undefined, 'MC Lab (Dr.BA)'),
  e('Thursday', 'slot-7', 'sub-mc', 'staff-ba', 'c-pharmd-3', 'Lab', undefined, 'MC Lab (Dr.BA)'),
  e('Thursday', 'slot-8', 'sub-mc', 'staff-ba', 'c-pharmd-3', 'Lecture', undefined, 'Tutorial MC (Dr. BA)'),

  // Friday
  e('Friday', 'slot-1', 'sub-pcol-2', 'staff-tvs', 'c-pharmd-3'),
  e('Friday', 'slot-2', 'sub-pa', 'staff-mvl', 'c-pharmd-3', 'Lecture', undefined, 'Tutorial PA (Dr.MVL)'),
  e('Friday', 'slot-3', 'sub-pj', 'staff-kak', 'c-pharmd-3'),
  e('Friday', 'slot-4', 'sub-mc', 'staff-ba', 'c-pharmd-3'),
  e('Friday', 'slot-5', 'sub-pa', 'staff-mvl', 'c-pharmd-3', 'Lab', undefined, 'PA Lab (Dr.MVL)'),
  e('Friday', 'slot-6', 'sub-pa', 'staff-mvl', 'c-pharmd-3', 'Lab', undefined, 'PA Lab (Dr.MVL)'),
  e('Friday', 'slot-7', 'sub-pa', 'staff-mvl', 'c-pharmd-3', 'Lab', undefined, 'PA Lab (Dr.MVL)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-pcol-2', 'staff-cs', 'c-pharmd-3'),
  e('Saturday', 'sat-2', 'sub-pt-2', 'staff-gvk', 'c-pharmd-3'),
  e('Saturday', 'sat-3', 'sub-pa', 'staff-mvl', 'c-pharmd-3'),
  e('Saturday', 'sat-4', 'sub-case-pres', 'staff-ks', 'c-pharmd-3', 'Clinical', undefined, 'Case Presentations (Dr. KS)'),
  e('Saturday', 'sat-5', 'sub-pf', 'staff-skab', 'c-pharmd-3'),
  e('Saturday', 'sat-6', 'sub-pf', 'staff-skab', 'c-pharmd-3'),

  // ==========================================
  // IV/VI PHARM. D (c-pharmd-4)
  // ==========================================
  // Monday (Ward Rounds / HP Lab)
  e('Monday', 'slot-1', 'sub-ward', 'staff-rt', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - (Dr. RT) / HP Lab'),
  e('Monday', 'slot-2', 'sub-ward', 'staff-rt', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - (Dr. RT) / HP Lab'),
  e('Monday', 'slot-3', 'sub-ward', 'staff-rt', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - (Dr. RT) / HP Lab'),
  e('Monday', 'slot-4', 'sub-ward', 'staff-rt', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - (Dr. RT) / HP Lab'),
  e('Monday', 'slot-5', 'sub-ward', 'staff-rt', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF - (Dr. RT) / HP Lab'),
  e('Monday', 'slot-7', 'sub-clinical-pharm', 'staff-alp', 'c-pharmd-4'),
  e('Monday', 'slot-8', 'sub-sports', 'staff-kvs', 'c-pharmd-4'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-bpk', 'staff-skab', 'c-pharmd-4'),
  e('Tuesday', 'slot-2', 'sub-brm', 'staff-kvs', 'c-pharmd-4'),
  e('Tuesday', 'slot-3', 'sub-clinical-pharm', 'staff-kp', 'c-pharmd-4'),
  e('Tuesday', 'slot-4', 'sub-pt-3', 'staff-grs', 'c-pharmd-4'),
  e('Tuesday', 'slot-5', 'sub-bpk', 'staff-ab', 'c-pharmd-4', 'Lab', undefined, 'BPK Lab (Dr.AB)'),
  e('Tuesday', 'slot-6', 'sub-bpk', 'staff-ab', 'c-pharmd-4', 'Lab', undefined, 'BPK Lab (Dr.AB)'),
  e('Tuesday', 'slot-7', 'sub-bpk', 'staff-ab', 'c-pharmd-4', 'Lab', undefined, 'BPK Lab (Dr.AB)'),
  e('Tuesday', 'slot-8', 'sub-act', 'staff-kvs', 'c-pharmd-4', 'Seminar', undefined, 'Mentoring'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-hp', 'staff-rt', 'c-pharmd-4'),
  e('Wednesday', 'slot-2', 'sub-bpk', 'staff-ab', 'c-pharmd-4'),
  e('Wednesday', 'slot-3', 'sub-brm', 'staff-kvs', 'c-pharmd-4'),
  e('Wednesday', 'slot-4', 'sub-ct', 'staff-rt', 'c-pharmd-4'),
  e('Wednesday', 'slot-5', 'sub-ct', 'staff-ks', 'c-pharmd-4'),
  e('Wednesday', 'slot-6', 'sub-brm', 'staff-kvs', 'c-pharmd-4', 'Lecture', undefined, 'Tutorial BRM (Dr.KVS)'),
  e('Wednesday', 'slot-7', 'sub-bpk', 'staff-ab', 'c-pharmd-4', 'Lecture', undefined, 'Tutorial BPK (Dr. AB)'),
  e('Wednesday', 'slot-8', 'sub-lib', 'staff-kvs', 'c-pharmd-4'),

  // Thursday (Ward Round)
  e('Thursday', 'slot-1', 'sub-ward', 'staff-kp', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (C.P Dr.KP)'),
  e('Thursday', 'slot-2', 'sub-ward', 'staff-kp', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (C.P Dr.KP)'),
  e('Thursday', 'slot-3', 'sub-ward', 'staff-kp', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (C.P Dr.KP)'),
  e('Thursday', 'slot-4', 'sub-ward', 'staff-kp', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (C.P Dr.KP)'),
  e('Thursday', 'slot-5', 'sub-ward', 'staff-kp', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (C.P Dr.KP)'),
  e('Thursday', 'slot-7', 'sub-pt-3', 'staff-grs', 'c-pharmd-4', 'Lecture', undefined, 'Tutorial PT-III (Dr.GRS)'),
  e('Thursday', 'slot-8', 'sub-case-pres', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Case Presentations (Dr. GRS)'),

  // Friday
  e('Friday', 'slot-1', 'sub-bpk', 'staff-ab', 'c-pharmd-4'),
  e('Friday', 'slot-2', 'sub-pt-3', 'staff-grs', 'c-pharmd-4'),
  e('Friday', 'slot-3', 'sub-hp', 'staff-rt', 'c-pharmd-4'),
  e('Friday', 'slot-4', 'sub-clinical-pharm', 'staff-kp', 'c-pharmd-4'),
  e('Friday', 'slot-5', 'sub-pt-3', 'staff-grs', 'c-pharmd-4'),
  e('Friday', 'slot-6', 'sub-ct', 'staff-ks', 'c-pharmd-4', 'Lecture', undefined, 'Tutorial CT (Dr. KS)'),
  e('Friday', 'slot-7', 'sub-hp', 'staff-rt', 'c-pharmd-4', 'Lecture', undefined, 'Tutorial H.P (Dr.RT)'),
  e('Friday', 'slot-8', 'sub-clinical-pharm', 'staff-kp', 'c-pharmd-4', 'Lecture', undefined, 'Tutorial C.P (Dr.KP)'),

  // Saturday (Ward Round)
  e('Saturday', 'sat-1', 'sub-ward', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (PT III Dr. GRS)'),
  e('Saturday', 'sat-2', 'sub-ward', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (PT III Dr. GRS)'),
  e('Saturday', 'sat-3', 'sub-ward', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (PT III Dr. GRS)'),
  e('Saturday', 'sat-4', 'sub-ward', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (PT III Dr. GRS)'),
  e('Saturday', 'sat-5', 'sub-ward', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (PT III Dr. GRS)'),
  e('Saturday', 'sat-6', 'sub-ward', 'staff-grs', 'c-pharmd-4', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (PT III Dr. GRS)'),

  // ==========================================
  // V/VI PHARM. D (c-pharmd-5)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-tdm', 'staff-grs', 'c-pharmd-5'),
  e('Monday', 'slot-2', 'sub-cr', 'staff-kvs', 'c-pharmd-5'),
  e('Monday', 'slot-3', 'sub-pepe', 'staff-kp', 'c-pharmd-5'),
  e('Monday', 'slot-4', 'sub-cr', 'staff-kvs', 'c-pharmd-5'),
  e('Monday', 'slot-5', 'sub-tdm', 'staff-grs', 'c-pharmd-5', 'Seminar', undefined, 'Seminar TDM (Dr.GRS)'),
  e('Monday', 'slot-6', 'sub-pepe', 'staff-kp', 'c-pharmd-5'),
  e('Monday', 'slot-7', 'sub-project', 'staff-kvs', 'c-pharmd-5', 'Seminar', undefined, 'Project'),
  e('Monday', 'slot-8', 'sub-clerkship', 'staff-kp', 'c-pharmd-5', 'Clinical', undefined, 'Clerkship'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KS)'),
  e('Tuesday', 'slot-2', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KS)'),
  e('Tuesday', 'slot-3', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KS)'),
  e('Tuesday', 'slot-4', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KS)'),
  e('Tuesday', 'slot-6', 'sub-pepe', 'staff-kp', 'c-pharmd-5'),
  e('Tuesday', 'slot-7', 'sub-cr', 'staff-kvs', 'c-pharmd-5', 'Seminar', undefined, 'Seminar CR (Dr.KVS)'),
  e('Tuesday', 'slot-8', 'sub-lib', 'staff-kp', 'c-pharmd-5'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-ward', 'staff-kp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KP, Dr.GRS)'),
  e('Wednesday', 'slot-2', 'sub-ward', 'staff-kp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KP, Dr.GRS)'),
  e('Wednesday', 'slot-3', 'sub-ward', 'staff-kp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KP, Dr.GRS)'),
  e('Wednesday', 'slot-4', 'sub-ward', 'staff-kp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KP, Dr.GRS)'),
  e('Wednesday', 'slot-6', 'sub-project', 'staff-kp', 'c-pharmd-5', 'Seminar', undefined, 'Project'),
  e('Wednesday', 'slot-7', 'sub-pepe', 'staff-kp', 'c-pharmd-5', 'Seminar', undefined, 'Seminar PEPE (Dr. KP)'),
  e('Wednesday', 'slot-8', 'sub-journal-club', 'staff-grs', 'c-pharmd-5', 'Seminar', undefined, 'Journal Club (Dr.GRS)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-ward', 'staff-alp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.ALP, Dr.KP, Dr.RT)'),
  e('Thursday', 'slot-2', 'sub-ward', 'staff-alp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.ALP, Dr.KP, Dr.RT)'),
  e('Thursday', 'slot-3', 'sub-ward', 'staff-alp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.ALP, Dr.KP, Dr.RT)'),
  e('Thursday', 'slot-4', 'sub-ward', 'staff-alp', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.ALP, Dr.KP, Dr.RT)'),
  e('Thursday', 'slot-6', 'sub-cr', 'staff-kvs', 'c-pharmd-5'),
  e('Thursday', 'slot-7', 'sub-journal-club', 'staff-alp', 'c-pharmd-5', 'Seminar', undefined, 'Journal Club (Smt.ALP)'),
  e('Thursday', 'slot-8', 'sub-clerkship', 'staff-kp', 'c-pharmd-5', 'Clinical', undefined, 'Clerkship'),

  // Friday
  e('Friday', 'slot-1', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KVS)'),
  e('Friday', 'slot-2', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KVS)'),
  e('Friday', 'slot-3', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KVS)'),
  e('Friday', 'slot-4', 'sub-ward', 'staff-gvk', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.GVK, Dr.KVS)'),
  e('Friday', 'slot-6', 'sub-tdm', 'staff-rt', 'c-pharmd-5'),
  e('Friday', 'slot-7', 'sub-act', 'staff-kp', 'c-pharmd-5', 'Seminar', undefined, 'Mentoring'),

  // Saturday (Ward Round)
  e('Saturday', 'sat-1', 'sub-ward', 'staff-kvs', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KVS, Dr.ALP, Dr.GRS)'),
  e('Saturday', 'sat-2', 'sub-ward', 'staff-kvs', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KVS, Dr.ALP, Dr.GRS)'),
  e('Saturday', 'sat-3', 'sub-ward', 'staff-kvs', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KVS, Dr.ALP, Dr.GRS)'),
  e('Saturday', 'sat-4', 'sub-ward', 'staff-kvs', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KVS, Dr.ALP, Dr.GRS)'),
  e('Saturday', 'sat-5', 'sub-ward', 'staff-kvs', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KVS, Dr.ALP, Dr.GRS)'),
  e('Saturday', 'sat-6', 'sub-ward', 'staff-kvs', 'c-pharmd-5', 'Clinical', undefined, 'Ward Round at Dr. PSIMS & RF (Dr.KVS, Dr.ALP, Dr.GRS)')
];
