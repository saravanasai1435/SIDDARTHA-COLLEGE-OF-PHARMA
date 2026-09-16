import { Subject } from '../../types';

export const ALL_SUBJECTS: Subject[] = [
  // Common / General / Support Subjects
  { id: 'sub-lib', code: 'LIBRARY', name: 'Library & Academic Reading', department: 'Academic Resource' },
  { id: 'sub-sports', code: 'SPORTS', name: 'Sports & Physical Health', department: 'Physical Education' },
  { id: 'sub-act', code: 'ACTIVITY', name: 'Activity / Mentoring Session', department: 'Student Affairs' },
  { id: 'sub-gpat', code: 'GPAT', name: 'GPAT Preparation & Coaching', department: 'Competitive Exams Cell' },
  { id: 'sub-seminar', code: 'SEMINAR', name: 'Seminar / Workshops', department: 'Academic Affairs' },
  { id: 'sub-case-pres', code: 'CASE PRES', name: 'Case Presentations', department: 'Pharmacy Practice' },
  { id: 'sub-ward', code: 'WARD ROUND', name: 'Ward Round at Dr. PSIMS & RF', department: 'Pharmacy Practice' },
  { id: 'sub-clerkship', code: 'CLERKSHIP', name: 'Hospital Clerkship', department: 'Pharmacy Practice' },
  { id: 'sub-project', code: 'PROJECT', name: 'Research Project', department: 'Academics & Research' },
  { id: 'sub-journal-club', code: 'JOURNAL CLUB', name: 'Journal Club', department: 'Pharmacy Practice' },
  { id: 'sub-practice-school', code: 'PRACTICE SCHOOL', name: 'Practice School', department: 'Industrial Pharmacy' },

  // B. Pharm I Year
  { id: 'sub-python', code: 'PYTHON', name: 'Basics of Python Programming for Pharmaceutical Sciences', department: 'Computer Sciences' },
  { id: 'sub-happ', code: 'HAPP', name: 'Human Anatomy, Physiology & Pathophysiology - I', department: 'Pharmacology' },
  { id: 'sub-gp', code: 'GP', name: 'General Pharmacy', department: 'Pharmaceutics' },
  { id: 'sub-pcog', code: 'P.Cog.', name: 'Introduction to Pharmacognosy', department: 'Pharmacognosy' },
  { id: 'sub-psych', code: 'PSYCHOLOGY', name: 'Healthcare Psychology & Communication Skills', department: 'Psychology' },
  { id: 'sub-piac', code: 'PIAC', name: 'Pharmaceutical Inorganic & Analytical Chemistry', department: 'Pharmaceutical Chemistry' },

  // B. Pharm II Year (III Sem)
  { id: 'sub-poc-2', code: 'POC-II', name: 'Pharmaceutical Organic Chemistry - II', department: 'Pharmaceutical Chemistry' },
  { id: 'sub-pe', code: 'PE', name: 'Pharmaceutical Engineering', department: 'Pharmaceutics' },
  { id: 'sub-pm', code: 'PM', name: 'Pharmaceutical Microbiology', department: 'Pharmaceutical Microbiology' },
  { id: 'sub-pp-1', code: 'PP-I', name: 'Physical Pharmaceutics - I', department: 'Pharmaceutics' },

  // B. Pharm III Year (V Sem)
  { id: 'sub-mc-2', code: 'MC-II', name: 'Medicinal Chemistry - II', department: 'Pharmaceutical Chemistry' },
  { id: 'sub-ip-1', code: 'IP-I', name: 'Industrial Pharmacy - I', department: 'Pharmaceutics' },
  { id: 'sub-pcol-2', code: 'P.Col-II', name: 'Pharmacology - II', department: 'Pharmacology' },
  { id: 'sub-pcol-3', code: 'P.Col-III', name: 'Pharmacology - III', department: 'Pharmacology' },
  { id: 'sub-pj', code: 'PJ', name: 'Pharmaceutical Jurisprudence', department: 'Pharmacy Practice' },
  { id: 'sub-pcog-2', code: 'P.Cog-II', name: 'Pharmacognosy & Phytochemistry - II', department: 'Pharmacognosy' },

  // B. Pharm IV Year (VII Sem)
  { id: 'sub-ima', code: 'IMA', name: 'Instrument Methods of Analysis', department: 'Pharmaceutical Analysis' },
  { id: 'sub-ndds', code: 'NDDS', name: 'Novel Drug Delivery System', department: 'Pharmaceutics' },
  { id: 'sub-ip-2', code: 'IP-II', name: 'Industrial Pharmacy - II', department: 'Pharmaceutics' },
  { id: 'sub-pp-practice', code: 'PP', name: 'Pharmacy Practice', department: 'Pharmacy Practice' },

  // Pharm. D I/VI
  { id: 'sub-hap', code: 'HAP', name: 'Human Anatomy & Physiology', department: 'Pharmacology' },
  { id: 'sub-biochem', code: 'MB / Biochem', name: 'Medicinal Biochemistry', department: 'Biochemistry' },
  { id: 'sub-pic', code: 'PIC', name: 'Pharmaceutical Inorganic Chemistry', department: 'Pharmaceutical Chemistry' },
  { id: 'sub-ph', code: 'PH', name: 'Pharmaceutics', department: 'Pharmaceutics' },
  { id: 'sub-poc', code: 'POC', name: 'Pharmaceutical Organic Chemistry', department: 'Pharmaceutical Chemistry' },
  { id: 'sub-math-bio', code: 'Maths/Biology', name: 'Remedial Mathematics / Biology', department: 'Remedial Sciences' },

  // Pharm. D II/VI
  { id: 'sub-patho', code: 'PP', name: 'Pathophysiology', department: 'Pharmacology' },
  { id: 'sub-ppp', code: 'PPP', name: 'Pharmacognosy & Phytopharmaceuticals', department: 'Pharmacognosy' },
  { id: 'sub-pcol-1', code: 'P. Col-I', name: 'Pharmacology - I', department: 'Pharmacology' },
  { id: 'sub-cp', code: 'CP', name: 'Community Pharmacy', department: 'Pharmacy Practice' },
  { id: 'sub-pt-1', code: 'PT-I', name: 'Pharmacotherapeutics - I', department: 'Pharmacy Practice' },

  // Pharm. D III/VI
  { id: 'sub-pa', code: 'PA', name: 'Pharmaceutical Analysis', department: 'Pharmaceutical Analysis' },
  { id: 'sub-pt-2', code: 'PT-II', name: 'Pharmacotherapeutics - II', department: 'Pharmacy Practice' },
  { id: 'sub-mc', code: 'MC', name: 'Medicinal Chemistry', department: 'Pharmaceutical Chemistry' },
  { id: 'sub-pf', code: 'PF', name: 'Pharmaceutical Formulations', department: 'Pharmaceutics' },

  // Pharm. D IV/VI
  { id: 'sub-pt-3', code: 'PT-III', name: 'Pharmacotherapeutics - III', department: 'Pharmacy Practice' },
  { id: 'sub-hp', code: 'HP', name: 'Hospital Pharmacy', department: 'Pharmacy Practice' },
  { id: 'sub-clinical-pharm', code: 'C.P', name: 'Clinical Pharmacy', department: 'Pharmacy Practice' },
  { id: 'sub-brm', code: 'BRM', name: 'Biostatistics & Research Methodology', department: 'Pharmacy Practice' },
  { id: 'sub-bpk', code: 'BPK', name: 'Biopharmaceutics & Pharmacokinetics', department: 'Pharmaceutics' },
  { id: 'sub-ct', code: 'CT', name: 'Clinical Toxicology', department: 'Pharmacy Practice' },

  // Pharm. D V/VI
  { id: 'sub-cr', code: 'CR', name: 'Clinical Research', department: 'Pharmacy Practice' },
  { id: 'sub-pepe', code: 'PEPE', name: 'Pharmacoepidemiology and Pharmacoeconomics', department: 'Pharmacy Practice' },
  { id: 'sub-tdm', code: 'TDM', name: 'Clinical Pharmacokinetics & Therapeutic Drug Monitoring', department: 'Pharmacy Practice' }
];
