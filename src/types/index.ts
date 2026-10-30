export type Role = 'student' | 'admin';

export type Profile = {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  enrollment_no: string | null;
  level: string | null;
  phone: string | null;
  is_disabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  semester: string;
  module: string;
  accent: string;
  created_at?: string;
};

export type MaterialType = 'note' | 'question_paper' | 'guide' | 'lab';

export type Material = {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  type: MaterialType;
  pages: number;
  downloads: number;
  created_at: string;
  semester: string | null;
  module: string | null;
  file_path: string | null;
  file_url?: string | null;
  upload_date: string;
  uploaded_by?: string | null;
  subject?: Subject | null;
};

export type Announcement = {
  id: string;
  title: string;
  description: string;
  published_at: string;
  priority: 'normal' | 'important';
  posted_by: string | null;
};

export type Feedback = {
  id: string;
  user_id: string;
  name: string;
  message: string;
  rating: number;
  status: 'new' | 'reviewed';
  created_at: string;
};

export type ContactRequest = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  response: string | null;
  created_at: string;
};

export type DownloadRecord = {
  id: string;
  action: 'view' | 'download';
  created_at: string;
  material: Material | null;
};

export type Payment = {
  id: string;
  payment_id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmation: string | null;
  created_at: string;
  user: Profile | null;
};

export type Assessment = {
  id: string;
  title: string;
  semester: string | null;
  assessment_date: string | null;
  status: 'planned' | 'open' | 'closed';
  notes: string | null;
  subject: Subject | null;
};

export type AppData = {
  subjects: Subject[];
  materials: Material[];
  announcements: Announcement[];
  feedback: Feedback[];
  contacts: ContactRequest[];
  downloads: DownloadRecord[];
  profiles: Profile[];
  payments: Payment[];
  assessments: Assessment[];
};

export type StudentView =
  | 'overview'
  | 'materials'
  | 'subjects'
  | 'papers'
  | 'downloads'
  | 'feedback'
  | 'contact'
  | 'announcements'
  | 'profile';

export type AdminView =
  | 'dashboard'
  | 'materials'
  | 'upload'
  | 'subjects'
  | 'semesters'
  | 'papers'
  | 'labs'
  | 'users'
  | 'feedback'
  | 'contact'
  | 'settings';
