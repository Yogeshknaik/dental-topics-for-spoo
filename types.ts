export interface Topic {
  id: string;
  sNo: number;
  title: string;
  link: string;
  subject: string;
  examDates?: string[]; // Added this
  // Default states from the HTML source (optional, mostly for migration)
  default10m?: boolean;
  default5m?: boolean;
  default2m?: boolean;
  defaultRevise?: boolean;
}

export enum ViewMode {
  SUBJECT = 'subject',
  EXAM = 'exam',
}

export interface ProgressState {
  [topicId: string]: {
    m10: boolean;
    m5: boolean;
    m2: boolean;
    revise: boolean;
    finalRevise: boolean;
  };
}

export enum ColumnType {
  M10 = 'm10',
  M5 = 'm5',
  M2 = 'm2',
  REVISE = 'revise',
  FINAL_REVISE = 'finalRevise',
}

export const SUBJECT_COLORS: Record<string, string> = {
  'Oral Medicine': 'bg-pink-100 text-pink-800',
  'Oral Radiology': 'bg-yellow-100 text-yellow-800',
  'Oral & Maxillofacial Surgery': 'bg-blue-100 text-blue-800',
  'Complete Denture': 'bg-gray-100 text-gray-700',
  'Fixed Partial Denture': 'bg-red-100 text-red-800',
  'Removable Partial Denture': 'bg-gray-200 text-gray-800',
  'Conservative Dentistry': 'bg-orange-100 text-orange-800', // Mapped 'brown' to orange for Tailwind standard palette
  'Endodontics': 'bg-green-100 text-green-800',
  'Paedodontics': 'bg-orange-200 text-orange-900',
  'Orthodontics': 'bg-purple-100 text-purple-800',
  'Community Dentistry': 'bg-pink-200 text-pink-900',
  'Periodontics': 'bg-rose-100 text-rose-800',
  'Prosthodontics': 'bg-indigo-100 text-indigo-800',
  'Cons and Endo': 'bg-emerald-100 text-emerald-800',
};