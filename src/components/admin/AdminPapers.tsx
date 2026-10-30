import { AdminMaterials } from './AdminMaterials';
import type { AppData } from '@/types';

export function AdminPapers({
  data,
  onRefresh,
  showToast,
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  return (
    <AdminMaterials
      data={data}
      onRefresh={onRefresh}
      showToast={showToast}
      forcedType="question_paper"
      pageTitle="Manage Question Papers"
      pageIntro="Maintain past university exam papers, model questions, and revision tests for all semesters."
    />
  );
}
