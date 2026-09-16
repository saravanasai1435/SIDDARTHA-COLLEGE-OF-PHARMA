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
  id: `tt-bp-${idCounter++}`,
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

export const BPHARM_ENTRIES: TimetableEntry[] = [
  // ==========================================
  // B. PHARM I YEAR - SECTION A (c-bpharm-1a)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-happ', 'staff-chnb', 'c-bpharm-1a'),
  e('Monday', 'slot-2', 'sub-piac', 'staff-tsm', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Monday', 'slot-2', 'sub-happ', 'staff-bnr', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Monday', 'slot-3', 'sub-piac', 'staff-tsm', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Monday', 'slot-3', 'sub-happ', 'staff-bnr', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Monday', 'slot-4', 'sub-piac', 'staff-tsm', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Monday', 'slot-4', 'sub-happ', 'staff-bnr', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Monday', 'slot-5', 'sub-happ', 'staff-chnb', 'c-bpharm-1a', 'Lecture', undefined, 'Tutorial (Dr.CHNB/Dr.BNR)'),
  e('Monday', 'slot-6', 'sub-gp', 'staff-skab', 'c-bpharm-1a'),
  e('Monday', 'slot-7', 'sub-pcog', 'staff-vk', 'c-bpharm-1a', 'Lecture', undefined, 'Tutorial (Dr.VK/Dr.PS)'),
  e('Monday', 'slot-8', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lecture', undefined, 'Remedial'),
  e('Monday', 'slot-9', 'sub-gp', 'staff-krs', 'c-bpharm-1a', 'Lecture', undefined, 'Remedial (Dr.KRS/Dr.Sk.AB)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-piac', 'staff-tsm', 'c-bpharm-1a'),
  e('Tuesday', 'slot-2', 'sub-happ', 'staff-chnb', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-2', 'sub-piac', 'staff-chp', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-3', 'sub-happ', 'staff-chnb', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-3', 'sub-piac', 'staff-chp', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-4', 'sub-happ', 'staff-chnb', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-4', 'sub-piac', 'staff-chp', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-5', 'sub-act', 'staff-chnb', 'c-bpharm-1a', 'Seminar', undefined, 'Activity / Mentoring'),
  e('Tuesday', 'slot-6', 'sub-psych', 'staff-rt', 'c-bpharm-1a', 'Lab', undefined, 'Psych Lab'),
  e('Tuesday', 'slot-7', 'sub-psych', 'staff-rt', 'c-bpharm-1a', 'Lab', undefined, 'Psych Lab'),
  e('Tuesday', 'slot-8', 'sub-psych', 'staff-rt', 'c-bpharm-1a', 'Lecture', undefined, 'Remedial Psych'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-piac', 'staff-chp', 'c-bpharm-1a'),
  e('Wednesday', 'slot-2', 'sub-happ', 'staff-chnb', 'c-bpharm-1a'),
  e('Wednesday', 'slot-3', 'sub-pcog', 'staff-vk', 'c-bpharm-1a'),
  e('Wednesday', 'slot-4', 'sub-gp', 'staff-krs', 'c-bpharm-1a', 'Lecture', undefined, 'Tutorial (Dr.KRS/Dr.Sk.AB)'),
  e('Wednesday', 'slot-5', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-5', 'sub-pcog', 'staff-vk', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-6', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-6', 'sub-pcog', 'staff-vk', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-7', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-7', 'sub-pcog', 'staff-vk', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-8', 'sub-pcog', 'staff-vk', 'c-bpharm-1a', 'Lecture', undefined, 'Remedial (Dr.VK/Dr.PS)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-happ', 'staff-bnr', 'c-bpharm-1a'),
  e('Thursday', 'slot-2', 'sub-gp', 'staff-skab', 'c-bpharm-1a'),
  e('Thursday', 'slot-3', 'sub-pcog', 'staff-ps', 'c-bpharm-1a'),
  e('Thursday', 'slot-4', 'sub-piac', 'staff-chp', 'c-bpharm-1a'),
  e('Thursday', 'slot-5', 'sub-gp', 'staff-skab', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Thursday', 'slot-5', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Thursday', 'slot-6', 'sub-gp', 'staff-skab', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Thursday', 'slot-6', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Thursday', 'slot-7', 'sub-gp', 'staff-skab', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Thursday', 'slot-7', 'sub-python', 'staff-gs', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Thursday', 'slot-8', 'sub-happ', 'staff-chnb', 'c-bpharm-1a', 'Lecture', undefined, 'Remedial (Dr.CHNB/Dr.BNR)'),

  // Friday
  e('Friday', 'slot-1', 'sub-gp', 'staff-krs', 'c-bpharm-1a'),
  e('Friday', 'slot-2', 'sub-pcog', 'staff-ps', 'c-bpharm-1a'),
  e('Friday', 'slot-3', 'sub-gp', 'staff-krs', 'c-bpharm-1a'),
  e('Friday', 'slot-4', 'sub-piac', 'staff-tsm', 'c-bpharm-1a'),
  e('Friday', 'slot-5', 'sub-pcog', 'staff-ps', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Friday', 'slot-5', 'sub-gp', 'staff-krs', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Friday', 'slot-6', 'sub-pcog', 'staff-ps', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Friday', 'slot-6', 'sub-gp', 'staff-krs', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Friday', 'slot-7', 'sub-pcog', 'staff-ps', 'c-bpharm-1a', 'Lab', 'BATCH I'),
  e('Friday', 'slot-7', 'sub-gp', 'staff-krs', 'c-bpharm-1a', 'Lab', 'BATCH II'),
  e('Friday', 'slot-8', 'sub-piac', 'staff-tsm', 'c-bpharm-1a', 'Lecture', undefined, 'Remedial (Ms.TSM/Ms.CH.P)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-psych', 'staff-gvk', 'c-bpharm-1a'),
  e('Saturday', 'sat-2', 'sub-pcog', 'staff-vk', 'c-bpharm-1a'),
  e('Saturday', 'sat-3', 'sub-happ', 'staff-bnr', 'c-bpharm-1a'),
  e('Saturday', 'sat-4', 'sub-lib', 'staff-chnb', 'c-bpharm-1a'),
  e('Saturday', 'sat-5', 'sub-piac', 'staff-tsm', 'c-bpharm-1a', 'Lecture', undefined, 'Tutorial (Ms.TSM/Ms.CH.P)'),
  e('Saturday', 'sat-6', 'sub-sports', 'staff-gs', 'c-bpharm-1a'),

  // ==========================================
  // B. PHARM I YEAR - SECTION B (c-bpharm-1b)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-pcog', 'staff-ps', 'c-bpharm-1b'),
  e('Monday', 'slot-2', 'sub-gp', 'staff-skab', 'c-bpharm-1b'),
  e('Monday', 'slot-3', 'sub-lib', 'staff-chnb', 'c-bpharm-1b'),
  e('Monday', 'slot-4', 'sub-gp', 'staff-krs', 'c-bpharm-1b', 'Lecture', undefined, 'Tutorial (Dr.KRS/Dr.Sk.AB)'),
  e('Monday', 'slot-5', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-5', 'sub-gp', 'staff-krs', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-6', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-6', 'sub-gp', 'staff-krs', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-7', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-7', 'sub-gp', 'staff-krs', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-8', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lecture', undefined, 'Tutorial / Remedial Python'),
  e('Monday', 'slot-9', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lecture', undefined, 'Remedial Python'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-pcog', 'staff-vk', 'c-bpharm-1b'),
  e('Tuesday', 'slot-2', 'sub-gp', 'staff-krs', 'c-bpharm-1b'),
  e('Tuesday', 'slot-3', 'sub-happ', 'staff-bnr', 'c-bpharm-1b'),
  e('Tuesday', 'slot-4', 'sub-piac', 'staff-tsm', 'c-bpharm-1b'),
  e('Tuesday', 'slot-5', 'sub-pcog', 'staff-vk', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-5', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-6', 'sub-pcog', 'staff-vk', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-6', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-7', 'sub-pcog', 'staff-vk', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-7', 'sub-python', 'staff-gs', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-8', 'sub-pcog', 'staff-vk', 'c-bpharm-1b', 'Lecture', undefined, 'Remedial (Dr.VK/Dr.PS)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-gp', 'staff-skab', 'c-bpharm-1b'),
  e('Wednesday', 'slot-2', 'sub-gp', 'staff-psrinivasu', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-2', 'sub-pcog', 'staff-ps', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-3', 'sub-gp', 'staff-psrinivasu', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-3', 'sub-pcog', 'staff-ps', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-4', 'sub-gp', 'staff-psrinivasu', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-4', 'sub-pcog', 'staff-ps', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-5', 'sub-pcog', 'staff-ps', 'c-bpharm-1b'),
  e('Wednesday', 'slot-6', 'sub-piac', 'staff-chp', 'c-bpharm-1b'),
  e('Wednesday', 'slot-7', 'sub-pcog', 'staff-vk', 'c-bpharm-1b', 'Lecture', undefined, 'Tutorial (Dr.VK/Dr.PS)'),
  e('Wednesday', 'slot-8', 'sub-happ', 'staff-chnb', 'c-bpharm-1b', 'Lecture', undefined, 'Remedial (Dr.CHNB/Dr.BNR)'),
  e('Wednesday', 'slot-9', 'sub-gp', 'staff-krs', 'c-bpharm-1b', 'Lecture', undefined, 'Remedial (Dr.KRS/Dr.Sk.AB)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-piac', 'staff-chp', 'c-bpharm-1b'),
  e('Thursday', 'slot-2', 'sub-piac', 'staff-tsm', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Thursday', 'slot-2', 'sub-happ', 'staff-chnb', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Thursday', 'slot-3', 'sub-piac', 'staff-tsm', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Thursday', 'slot-3', 'sub-happ', 'staff-chnb', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Thursday', 'slot-4', 'sub-piac', 'staff-tsm', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Thursday', 'slot-4', 'sub-happ', 'staff-chnb', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Thursday', 'slot-5', 'sub-happ', 'staff-bnr', 'c-bpharm-1b'),
  e('Thursday', 'slot-6', 'sub-pcog', 'staff-vk', 'c-bpharm-1b'),
  e('Thursday', 'slot-7', 'sub-piac', 'staff-tsm', 'c-bpharm-1b', 'Lecture', undefined, 'Tutorial (Ms.TSM/Ms.CH.P)'),
  e('Thursday', 'slot-8', 'sub-piac', 'staff-tsm', 'c-bpharm-1b', 'Lecture', undefined, 'Remedial (Ms.TSM/Ms.CH.P)'),
  e('Thursday', 'slot-9', 'sub-sports', 'staff-gs', 'c-bpharm-1b'),

  // Friday
  e('Friday', 'slot-1', 'sub-happ', 'staff-chnb', 'c-bpharm-1b'),
  e('Friday', 'slot-2', 'sub-piac', 'staff-chp', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-2', 'sub-happ', 'staff-bnr', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Friday', 'slot-3', 'sub-piac', 'staff-chp', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-3', 'sub-happ', 'staff-bnr', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Friday', 'slot-4', 'sub-piac', 'staff-chp', 'c-bpharm-1b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-4', 'sub-happ', 'staff-bnr', 'c-bpharm-1b', 'Lab', 'BATCH II'),
  e('Friday', 'slot-5', 'sub-act', 'staff-chnb', 'c-bpharm-1b', 'Seminar', undefined, 'Activity / Mentoring'),
  e('Friday', 'slot-6', 'sub-psych', 'staff-gvk', 'c-bpharm-1b', 'Lab', undefined, 'Psych Lab (Dr.GVK)'),
  e('Friday', 'slot-7', 'sub-psych', 'staff-gvk', 'c-bpharm-1b', 'Lab', undefined, 'Psych Lab (Dr.GVK)'),
  e('Friday', 'slot-8', 'sub-psych', 'staff-gvk', 'c-bpharm-1b', 'Lecture', undefined, 'Tutorial / Remedial Psych'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-psych', 'staff-gvk', 'c-bpharm-1b'),
  e('Saturday', 'sat-2', 'sub-happ', 'staff-chnb', 'c-bpharm-1b'),
  e('Saturday', 'sat-3', 'sub-gp', 'staff-krs', 'c-bpharm-1b'),
  e('Saturday', 'sat-4', 'sub-piac', 'staff-tsm', 'c-bpharm-1b'),
  e('Saturday', 'sat-5', 'sub-happ', 'staff-chnb', 'c-bpharm-1b', 'Lecture', undefined, 'Tutorial (Dr.CHNB/Dr.BNR)'),
  e('Saturday', 'sat-6', 'sub-sports', 'staff-gs', 'c-bpharm-1b'),

  // ==========================================
  // B. PHARM II YEAR - SECTION A (c-bpharm-2a)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-pe', 'staff-kak', 'c-bpharm-2a'),
  e('Monday', 'slot-2', 'sub-pe', 'staff-kak', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Monday', 'slot-2', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Monday', 'slot-3', 'sub-pe', 'staff-kak', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Monday', 'slot-3', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Monday', 'slot-4', 'sub-pe', 'staff-kak', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Monday', 'slot-4', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Monday', 'slot-5', 'sub-pm', 'staff-nkd', 'c-bpharm-2a'),
  e('Monday', 'slot-6', 'sub-act', 'staff-ku', 'c-bpharm-2a', 'Seminar', undefined, 'Activity'),
  e('Monday', 'slot-7', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a', 'Lecture', undefined, 'Tutorial (Dr.AB/Smt.RA)'),
  e('Monday', 'slot-8', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a', 'Lecture', undefined, 'Remedial (Dr.AB/Smt.RA)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-poc-2', 'staff-kdp', 'c-bpharm-2a'),
  e('Tuesday', 'slot-2', 'sub-pm', 'staff-ku', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-2', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-3', 'sub-pm', 'staff-ku', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-3', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-4', 'sub-pm', 'staff-ku', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-4', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-5', 'sub-pe', 'staff-kak', 'c-bpharm-2a', 'Lecture', undefined, 'Tutorial (Sri.KAK/Smt.PS)'),
  e('Tuesday', 'slot-6', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a'),
  e('Tuesday', 'slot-7', 'sub-pm', 'staff-nkd', 'c-bpharm-2a', 'Lecture', undefined, 'Tutorial (Dr.NKD/Dr.KU)'),
  e('Tuesday', 'slot-8', 'sub-pm', 'staff-nkd', 'c-bpharm-2a', 'Lecture', undefined, 'Remedial (Dr.NKD/Dr.KU)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-pp-1', 'staff-ra', 'c-bpharm-2a'),
  e('Wednesday', 'slot-2', 'sub-poc-2', 'staff-rl', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-2', 'sub-pm', 'staff-ku', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-3', 'sub-poc-2', 'staff-rl', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-3', 'sub-pm', 'staff-ku', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-4', 'sub-poc-2', 'staff-rl', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-4', 'sub-pm', 'staff-ku', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-5', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a'),
  e('Wednesday', 'slot-6', 'sub-act', 'staff-ku', 'c-bpharm-2a', 'Seminar', undefined, 'Mentoring'),
  e('Wednesday', 'slot-7', 'sub-pm', 'staff-ku', 'c-bpharm-2a'),
  e('Wednesday', 'slot-8', 'sub-sports', 'staff-kak', 'c-bpharm-2a'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-pe', 'staff-psravanthi', 'c-bpharm-2a'),
  e('Thursday', 'slot-2', 'sub-pp-1', 'staff-ra', 'c-bpharm-2a'),
  e('Thursday', 'slot-3', 'sub-pm', 'staff-nkd', 'c-bpharm-2a'),
  e('Thursday', 'slot-4', 'sub-lib', 'staff-ku', 'c-bpharm-2a'),
  e('Thursday', 'slot-5', 'sub-seminar', 'staff-ku', 'c-bpharm-2a', 'Seminar', undefined, 'Seminars'),
  e('Thursday', 'slot-6', 'sub-seminar', 'staff-ku', 'c-bpharm-2a', 'Seminar', undefined, 'Seminars'),
  e('Thursday', 'slot-7', 'sub-seminar', 'staff-ku', 'c-bpharm-2a', 'Seminar', undefined, 'Seminars'),
  e('Thursday', 'slot-8', 'sub-seminar', 'staff-ku', 'c-bpharm-2a', 'Seminar', undefined, 'Seminars'),

  // Friday
  e('Friday', 'slot-1', 'sub-pe', 'staff-psravanthi', 'c-bpharm-2a'),
  e('Friday', 'slot-2', 'sub-pp-1', 'staff-ra', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Friday', 'slot-2', 'sub-pe', 'staff-psravanthi', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Friday', 'slot-3', 'sub-pp-1', 'staff-ra', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Friday', 'slot-3', 'sub-pe', 'staff-psravanthi', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Friday', 'slot-4', 'sub-pp-1', 'staff-ra', 'c-bpharm-2a', 'Lab', 'BATCH I'),
  e('Friday', 'slot-4', 'sub-pe', 'staff-psravanthi', 'c-bpharm-2a', 'Lab', 'BATCH II'),
  e('Friday', 'slot-5', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a', 'Lecture', undefined, 'Tutorial (Dr.TSD/Mr.KDP)'),
  e('Friday', 'slot-6', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a'),
  e('Friday', 'slot-7', 'sub-lib', 'staff-ku', 'c-bpharm-2a'),
  e('Friday', 'slot-8', 'sub-pe', 'staff-kak', 'c-bpharm-2a', 'Lecture', undefined, 'Remedial (Sri.KAK/Smt.PS)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-poc-2', 'staff-kdp', 'c-bpharm-2a'),
  e('Saturday', 'sat-2', 'sub-pp-1', 'staff-ab', 'c-bpharm-2a'),
  e('Saturday', 'sat-3', 'sub-pe', 'staff-kak', 'c-bpharm-2a'),
  e('Saturday', 'sat-4', 'sub-pm', 'staff-ku', 'c-bpharm-2a'),
  e('Saturday', 'sat-5', 'sub-sports', 'staff-kak', 'c-bpharm-2a'),
  e('Saturday', 'sat-6', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2a', 'Lecture', undefined, 'Remedial (Dr.TSD/Mr.KDP)'),

  // ==========================================
  // B. PHARM II YEAR - SECTION B (c-bpharm-2b)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-pm', 'staff-ku', 'c-bpharm-2b'),
  e('Monday', 'slot-2', 'sub-pp-1', 'staff-psrinivasu', 'c-bpharm-2b'),
  e('Monday', 'slot-3', 'sub-act', 'staff-tsd', 'c-bpharm-2b', 'Seminar', undefined, 'Activity'),
  e('Monday', 'slot-4', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b', 'Lecture', undefined, 'Tutorial (Dr.TSD/Dr.VN)'),
  e('Monday', 'slot-5', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-5', 'sub-pm', 'staff-ku', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-6', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-6', 'sub-pm', 'staff-ku', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-7', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-7', 'sub-pm', 'staff-ku', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-8', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Monday', 'slot-8', 'sub-pm', 'staff-ku', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Monday', 'slot-9', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b', 'Lecture', undefined, 'Remedial (Dr.TSD/Dr.VN)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b'),
  e('Tuesday', 'slot-2', 'sub-pe', 'staff-tpr', 'c-bpharm-2b'),
  e('Tuesday', 'slot-3', 'sub-lib', 'staff-tsd', 'c-bpharm-2b'),
  e('Tuesday', 'slot-4', 'sub-pe', 'staff-tpr', 'c-bpharm-2b', 'Lecture', undefined, 'Tutorial (Dr.TPR/Sri.KAK)'),
  e('Tuesday', 'slot-5', 'sub-pm', 'staff-nkd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-5', 'sub-poc-2', 'staff-rl', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-6', 'sub-pm', 'staff-nkd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-6', 'sub-poc-2', 'staff-rl', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-7', 'sub-pm', 'staff-nkd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-7', 'sub-poc-2', 'staff-rl', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-8', 'sub-pm', 'staff-nkd', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Tuesday', 'slot-8', 'sub-poc-2', 'staff-rl', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-9', 'sub-pm', 'staff-nkd', 'c-bpharm-2b', 'Lecture', undefined, 'Remedial (Dr.NKD/Dr.KU)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-pm', 'staff-nkd', 'c-bpharm-2b'),
  e('Wednesday', 'slot-2', 'sub-poc-2', 'staff-vn', 'c-bpharm-2b'),
  e('Wednesday', 'slot-3', 'sub-pe', 'staff-kak', 'c-bpharm-2b'),
  e('Wednesday', 'slot-4', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b'),
  e('Wednesday', 'slot-5', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-5', 'sub-pe', 'staff-kak', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-6', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-6', 'sub-pe', 'staff-kak', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-7', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-7', 'sub-pe', 'staff-kak', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-8', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Wednesday', 'slot-8', 'sub-pe', 'staff-kak', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Wednesday', 'slot-9', 'sub-pe', 'staff-tpr', 'c-bpharm-2b', 'Lecture', undefined, 'Remedial (Dr.TPR/Sri.KAK)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-pe', 'staff-kak', 'c-bpharm-2b'),
  e('Thursday', 'slot-2', 'sub-poc-2', 'staff-vn', 'c-bpharm-2b'),
  e('Thursday', 'slot-3', 'sub-pp-1', 'staff-psrinivasu', 'c-bpharm-2b'),
  e('Thursday', 'slot-4', 'sub-pm', 'staff-ku', 'c-bpharm-2b'),
  e('Thursday', 'slot-5', 'sub-seminar', 'staff-tsd', 'c-bpharm-2b', 'Seminar', undefined, 'Seminar / Workshops'),
  e('Thursday', 'slot-6', 'sub-seminar', 'staff-tsd', 'c-bpharm-2b', 'Seminar', undefined, 'Seminar / Workshops'),
  e('Thursday', 'slot-7', 'sub-seminar', 'staff-tsd', 'c-bpharm-2b', 'Seminar', undefined, 'Seminar / Workshops'),
  e('Thursday', 'slot-8', 'sub-seminar', 'staff-tsd', 'c-bpharm-2b', 'Seminar', undefined, 'Seminar / Workshops'),

  // Friday
  e('Friday', 'slot-1', 'sub-poc-2', 'staff-tsd', 'c-bpharm-2b'),
  e('Friday', 'slot-2', 'sub-pm', 'staff-nkd', 'c-bpharm-2b', 'Lecture', undefined, 'Tutorial (Dr.NKD/Dr.KU)'),
  e('Friday', 'slot-3', 'sub-act', 'staff-tsd', 'c-bpharm-2b', 'Seminar', undefined, 'Mentoring'),
  e('Friday', 'slot-4', 'sub-pm', 'staff-nkd', 'c-bpharm-2b'),
  e('Friday', 'slot-5', 'sub-pe', 'staff-tpr', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-5', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Friday', 'slot-6', 'sub-pe', 'staff-tpr', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-6', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Friday', 'slot-7', 'sub-pe', 'staff-tpr', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-7', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH II'),
  e('Friday', 'slot-8', 'sub-pe', 'staff-tpr', 'c-bpharm-2b', 'Lab', 'BATCH I'),
  e('Friday', 'slot-8', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lab', 'BATCH II'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-pe', 'staff-tpr', 'c-bpharm-2b'),
  e('Saturday', 'sat-2', 'sub-lib', 'staff-tsd', 'c-bpharm-2b'),
  e('Saturday', 'sat-3', 'sub-poc-2', 'staff-vn', 'c-bpharm-2b'),
  e('Saturday', 'sat-4', 'sub-sports', 'staff-tsd', 'c-bpharm-2b'),
  e('Saturday', 'sat-5', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lecture', undefined, 'Tutorial (Smt.RA/Mr.PS)'),
  e('Saturday', 'sat-6', 'sub-pp-1', 'staff-ra', 'c-bpharm-2b', 'Lecture', undefined, 'Remedial (Smt.RA/Mr.PS)'),

  // ==========================================
  // B. PHARM III YEAR - SECTION A (c-bpharm-3a)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a'),
  e('Monday', 'slot-2', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Monday', 'slot-2', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Monday', 'slot-3', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Monday', 'slot-3', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Monday', 'slot-4', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Monday', 'slot-4', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Monday', 'slot-5', 'sub-mc-2', 'staff-rl', 'c-bpharm-3a'),
  e('Monday', 'slot-6', 'sub-lib', 'staff-ps', 'c-bpharm-3a'),
  e('Monday', 'slot-7', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a', 'Lecture', undefined, 'Tutorial (Dr.TPR/Smt.PS)'),
  e('Monday', 'slot-8', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a', 'Lecture', undefined, 'Remedial (Dr.TPR/Smt.PS)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-pj', 'staff-kshanmukhi', 'c-bpharm-3a'),
  e('Tuesday', 'slot-2', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Tuesday', 'slot-2', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Tuesday', 'slot-3', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Tuesday', 'slot-3', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Tuesday', 'slot-4', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Tuesday', 'slot-4', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Tuesday', 'slot-5', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3a'),
  e('Tuesday', 'slot-6', 'sub-act', 'staff-ps', 'c-bpharm-3a', 'Seminar', undefined, 'Activity'),
  e('Tuesday', 'slot-7', 'sub-pj', 'staff-psrinivasu', 'c-bpharm-3a', 'Lecture', undefined, 'Tutorial (Mr.PS/Ms.KS)'),
  e('Tuesday', 'slot-8', 'sub-pj', 'staff-psrinivasu', 'c-bpharm-3a', 'Lecture', undefined, 'Remedial (Mr.PS/Ms.KS)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3a'),
  e('Wednesday', 'slot-2', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3a'),
  e('Wednesday', 'slot-3', 'sub-gpat', 'staff-ps', 'c-bpharm-3a'),
  e('Wednesday', 'slot-4', 'sub-mc-2', 'staff-vn', 'c-bpharm-3a'),
  e('Wednesday', 'slot-5', 'sub-pj', 'staff-kshanmukhi', 'c-bpharm-3a'),
  e('Wednesday', 'slot-6', 'sub-mc-2', 'staff-rl', 'c-bpharm-3a'),
  e('Wednesday', 'slot-7', 'sub-sports', 'staff-ps', 'c-bpharm-3a'),
  e('Wednesday', 'slot-8', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lecture', undefined, 'Remedial (Dr.VK/Smt.SK.AB)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a'),
  e('Thursday', 'slot-2', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Thursday', 'slot-2', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Thursday', 'slot-3', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Thursday', 'slot-3', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Thursday', 'slot-4', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3a', 'Lab', 'Batch I'),
  e('Thursday', 'slot-4', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a', 'Lab', 'Batch II'),
  e('Thursday', 'slot-5', 'sub-pj', 'staff-psrinivasu', 'c-bpharm-3a'),
  e('Thursday', 'slot-6', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lecture', undefined, 'Dr.VK / Smt.SK.AB'),
  e('Thursday', 'slot-7', 'sub-mc-2', 'staff-vn', 'c-bpharm-3a', 'Lecture', undefined, 'Tutorial (Dr.VN/Smt.RL)'),
  e('Thursday', 'slot-8', 'sub-mc-2', 'staff-vn', 'c-bpharm-3a', 'Lecture', undefined, 'Remedial (Dr.VN/Smt.RL)'),

  // Friday
  e('Friday', 'slot-1', 'sub-mc-2', 'staff-rl', 'c-bpharm-3a'),
  e('Friday', 'slot-2', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3a'),
  e('Friday', 'slot-3', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a'),
  e('Friday', 'slot-4', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3a'),
  e('Friday', 'slot-5', 'sub-gpat', 'staff-ps', 'c-bpharm-3a'),
  e('Friday', 'slot-6', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lecture', undefined, 'Dr.VK / Smt.SK.AB'),
  e('Friday', 'slot-7', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a', 'Lecture', undefined, 'Tutorial (Dr.CHS/Smt.GHS)'),
  e('Friday', 'slot-8', 'sub-pcol-2', 'staff-cs', 'c-bpharm-3a', 'Lecture', undefined, 'Remedial (Dr.CHS/Smt.GHS)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3a'),
  e('Saturday', 'sat-2', 'sub-pj', 'staff-psrinivasu', 'c-bpharm-3a'),
  e('Saturday', 'sat-3', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3a'),
  e('Saturday', 'sat-4', 'sub-lib', 'staff-ps', 'c-bpharm-3a'),
  e('Saturday', 'sat-5', 'sub-act', 'staff-ps', 'c-bpharm-3a', 'Seminar', undefined, 'Mentoring'),
  e('Saturday', 'sat-6', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3a', 'Lecture', undefined, 'Tutorial (Dr.VK/Smt.SK.AB)'),

  // ==========================================
  // B. PHARM III YEAR - SECTION B (c-bpharm-3b)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3b'),
  e('Monday', 'slot-2', 'sub-lib', 'staff-ghs', 'c-bpharm-3b'),
  e('Monday', 'slot-3', 'sub-gpat', 'staff-ghs', 'c-bpharm-3b'),
  e('Monday', 'slot-4', 'sub-pj', 'staff-kshanmukhi', 'c-bpharm-3b', 'Lecture', undefined, 'Tutorial (Ms.KS/Smt.PS)'),
  e('Monday', 'slot-5', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Monday', 'slot-5', 'sub-ip-1', 'staff-psrinivasu', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Monday', 'slot-6', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Monday', 'slot-6', 'sub-ip-1', 'staff-psrinivasu', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Monday', 'slot-7', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Monday', 'slot-7', 'sub-ip-1', 'staff-psrinivasu', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Monday', 'slot-8', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Monday', 'slot-8', 'sub-ip-1', 'staff-psrinivasu', 'c-bpharm-3b', 'Lab', 'Batch II'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-pj', 'staff-psravanthi', 'c-bpharm-3b'),
  e('Tuesday', 'slot-2', 'sub-ip-1', 'staff-psrinivasu', 'c-bpharm-3b'),
  e('Tuesday', 'slot-3', 'sub-mc-2', 'staff-rl', 'c-bpharm-3b'),
  e('Tuesday', 'slot-4', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3b'),
  e('Tuesday', 'slot-5', 'sub-mc-2', 'staff-rl', 'c-bpharm-3b'),
  e('Tuesday', 'slot-6', 'sub-sports', 'staff-ghs', 'c-bpharm-3b'),
  e('Tuesday', 'slot-7', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3b', 'Lecture', undefined, 'Dr.PS / Smt.SK.AB'),
  e('Tuesday', 'slot-8', 'sub-mc-2', 'staff-vn', 'c-bpharm-3b', 'Lecture', undefined, 'Remedial (Dr.VN/Smt.RL)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3b', 'Lecture', undefined, 'Dr.PS / Smt.SK.AB'),
  e('Wednesday', 'slot-2', 'sub-gpat', 'staff-ghs', 'c-bpharm-3b'),
  e('Wednesday', 'slot-3', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3b'),
  e('Wednesday', 'slot-4', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b'),
  e('Wednesday', 'slot-5', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3b'),
  e('Wednesday', 'slot-6', 'sub-pj', 'staff-psravanthi', 'c-bpharm-3b'),
  e('Wednesday', 'slot-7', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3b', 'Lecture', undefined, 'Tutorial (Dr.TPR/Mr.PS)'),
  e('Wednesday', 'slot-8', 'sub-ip-1', 'staff-tpr', 'c-bpharm-3b', 'Lecture', undefined, 'Remedial (Dr.TPR/Mr.PS)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3b'),
  e('Thursday', 'slot-2', 'sub-pj', 'staff-kshanmukhi', 'c-bpharm-3b'),
  e('Thursday', 'slot-3', 'sub-act', 'staff-ghs', 'c-bpharm-3b', 'Seminar', undefined, 'Activity'),
  e('Thursday', 'slot-4', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3b'),
  e('Thursday', 'slot-5', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b'),
  e('Thursday', 'slot-6', 'sub-act', 'staff-ghs', 'c-bpharm-3b', 'Seminar', undefined, 'Mentoring'),
  e('Thursday', 'slot-7', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b', 'Lecture', undefined, 'Tutorial (Dr.CHS/Smt.GHS)'),
  e('Thursday', 'slot-8', 'sub-pcol-3', 'staff-cs', 'c-bpharm-3b', 'Lecture', undefined, 'Remedial (Dr.CHS/Smt.GHS)'),

  // Friday
  e('Friday', 'slot-1', 'sub-mc-2', 'staff-vn', 'c-bpharm-3b'),
  e('Friday', 'slot-2', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Friday', 'slot-2', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Friday', 'slot-3', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Friday', 'slot-3', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Friday', 'slot-4', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Friday', 'slot-4', 'sub-pcol-2', 'staff-ghs', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Friday', 'slot-5', 'sub-ip-1', 'staff-psrinivasu', 'c-bpharm-3b'),
  e('Friday', 'slot-6', 'sub-mc-2', 'staff-vn', 'c-bpharm-3b', 'Lecture', undefined, 'Tutorial (Dr.VN/Smt.RL)'),
  e('Friday', 'slot-7', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3b', 'Lecture', undefined, 'Tutorial (Dr.PS/Smt.SK.AB)'),
  e('Friday', 'slot-8', 'sub-pcog-2', 'staff-vk', 'c-bpharm-3b', 'Lecture', undefined, 'Remedial (Dr.VK/Dr.PS)'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-pj', 'staff-kshanmukhi', 'c-bpharm-3b'),
  e('Saturday', 'sat-2', 'sub-mc-2', 'staff-rl', 'c-bpharm-3b'),
  e('Saturday', 'sat-3', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Saturday', 'sat-3', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Saturday', 'sat-4', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Saturday', 'sat-4', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Saturday', 'sat-5', 'sub-ip-1', 'staff-psravanthi', 'c-bpharm-3b', 'Lab', 'Batch I'),
  e('Saturday', 'sat-5', 'sub-pcog-2', 'staff-ps', 'c-bpharm-3b', 'Lab', 'Batch II'),
  e('Saturday', 'sat-6', 'sub-pj', 'staff-kshanmukhi', 'c-bpharm-3b', 'Lecture', undefined, 'Tutorial / Remedial (Ms.KS/Smt.PS)'),

  // ==========================================
  // B. PHARM IV YEAR (VII SEM - ROOM 303) (c-bpharm-4)
  // ==========================================
  // Monday
  e('Monday', 'slot-1', 'sub-ima', 'staff-khb', 'c-bpharm-4'),
  e('Monday', 'slot-2', 'sub-lib', 'staff-krs', 'c-bpharm-4'),
  e('Monday', 'slot-3', 'sub-ndds', 'staff-gr', 'c-bpharm-4'),
  e('Monday', 'slot-4', 'sub-ip-2', 'staff-psrinivasu', 'c-bpharm-4'),
  e('Monday', 'slot-5', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH I'),
  e('Monday', 'slot-5', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH II, III, IV'),
  e('Monday', 'slot-6', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH I'),
  e('Monday', 'slot-6', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH II, III, IV'),
  e('Monday', 'slot-7', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH I'),
  e('Monday', 'slot-7', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH II, III, IV'),
  e('Monday', 'slot-8', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH I'),
  e('Monday', 'slot-8', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH II, III, IV'),
  e('Monday', 'slot-9', 'sub-ndds', 'staff-gr', 'c-bpharm-4', 'Lecture', undefined, 'Remedial (Dr.GR/Dr.KRS)'),

  // Tuesday
  e('Tuesday', 'slot-1', 'sub-ndds', 'staff-gr', 'c-bpharm-4'),
  e('Tuesday', 'slot-2', 'sub-pp-practice', 'staff-kramya', 'c-bpharm-4', 'Lecture', undefined, 'Tutorial (Smt.RS/Ms.RT)'),
  e('Tuesday', 'slot-3', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lecture', undefined, 'Tutorial (Dr.KHB/Smt.KJ)'),
  e('Tuesday', 'slot-4', 'sub-pp-practice', 'staff-rt', 'c-bpharm-4'),
  e('Tuesday', 'slot-5', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, III, IV'),
  e('Tuesday', 'slot-5', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-6', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, III, IV'),
  e('Tuesday', 'slot-6', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-7', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, III, IV'),
  e('Tuesday', 'slot-7', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-8', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, III, IV'),
  e('Tuesday', 'slot-8', 'sub-ima', 'staff-kj', 'c-bpharm-4', 'Lab', 'BATCH II'),
  e('Tuesday', 'slot-9', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lecture', undefined, 'Remedial (Dr.KHB/Smt.KJ)'),

  // Wednesday
  e('Wednesday', 'slot-1', 'sub-ndds', 'staff-krs', 'c-bpharm-4'),
  e('Wednesday', 'slot-2', 'sub-gpat', 'staff-krs', 'c-bpharm-4'),
  e('Wednesday', 'slot-3', 'sub-act', 'staff-krs', 'c-bpharm-4', 'Seminar', undefined, 'Activity'),
  e('Wednesday', 'slot-4', 'sub-ip-2', 'staff-kak', 'c-bpharm-4'),
  e('Wednesday', 'slot-5', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, IV'),
  e('Wednesday', 'slot-5', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH III'),
  e('Wednesday', 'slot-6', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, IV'),
  e('Wednesday', 'slot-6', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH III'),
  e('Wednesday', 'slot-7', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, IV'),
  e('Wednesday', 'slot-7', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH III'),
  e('Wednesday', 'slot-8', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, IV'),
  e('Wednesday', 'slot-8', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH III'),
  e('Wednesday', 'slot-9', 'sub-ip-2', 'staff-kak', 'c-bpharm-4', 'Lecture', undefined, 'Remedial (Mr.KAK/Mr.PS)'),

  // Thursday
  e('Thursday', 'slot-1', 'sub-pp-practice', 'staff-kramya', 'c-bpharm-4'),
  e('Thursday', 'slot-2', 'sub-ip-2', 'staff-kak', 'c-bpharm-4', 'Lecture', undefined, 'Tutorial (Mr.KAK/Mr.PS)'),
  e('Thursday', 'slot-3', 'sub-lib', 'staff-krs', 'c-bpharm-4'),
  e('Thursday', 'slot-4', 'sub-ndds', 'staff-krs', 'c-bpharm-4'),
  e('Thursday', 'slot-5', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, III'),
  e('Thursday', 'slot-5', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH IV'),
  e('Thursday', 'slot-6', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, III'),
  e('Thursday', 'slot-6', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH IV'),
  e('Thursday', 'slot-7', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, III'),
  e('Thursday', 'slot-7', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH IV'),
  e('Thursday', 'slot-8', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', 'BATCH I, II, III'),
  e('Thursday', 'slot-8', 'sub-ima', 'staff-khb', 'c-bpharm-4', 'Lab', 'BATCH IV'),
  e('Thursday', 'slot-9', 'sub-pp-practice', 'staff-kramya', 'c-bpharm-4', 'Lecture', undefined, 'Remedial (Smt.RS/Ms.RT)'),

  // Friday
  e('Friday', 'slot-1', 'sub-ima', 'staff-kj', 'c-bpharm-4'),
  e('Friday', 'slot-2', 'sub-gpat', 'staff-krs', 'c-bpharm-4'),
  e('Friday', 'slot-3', 'sub-ip-2', 'staff-psrinivasu', 'c-bpharm-4'),
  e('Friday', 'slot-4', 'sub-pp-practice', 'staff-kramya', 'c-bpharm-4'),
  e('Friday', 'slot-5', 'sub-ima', 'staff-khb', 'c-bpharm-4'),
  e('Friday', 'slot-6', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', undefined, 'Practice School'),
  e('Friday', 'slot-7', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', undefined, 'Practice School'),
  e('Friday', 'slot-8', 'sub-practice-school', 'staff-psrinivasu', 'c-bpharm-4', 'Lab', undefined, 'Practice School'),

  // Saturday
  e('Saturday', 'sat-1', 'sub-pp-practice', 'staff-rt', 'c-bpharm-4'),
  e('Saturday', 'sat-2', 'sub-ip-2', 'staff-kak', 'c-bpharm-4'),
  e('Saturday', 'sat-3', 'sub-ima', 'staff-kj', 'c-bpharm-4'),
  e('Saturday', 'sat-4', 'sub-act', 'staff-krs', 'c-bpharm-4', 'Seminar', undefined, 'Mentoring'),
  e('Saturday', 'sat-5', 'sub-ndds', 'staff-gr', 'c-bpharm-4', 'Lecture', undefined, 'Tutorial (Dr.GR/Dr.KRS)'),
  e('Saturday', 'sat-6', 'sub-sports', 'staff-krs', 'c-bpharm-4')
];
