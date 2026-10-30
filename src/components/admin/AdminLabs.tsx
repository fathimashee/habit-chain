import { AdminMaterials } from './AdminMaterials';
import type { AppData } from '@/types';

export function AdminLabs({
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
      forcedType="lab"
      pageTitle="Manage Lab Manuals and Programs"
      pageIntro="Manage practical manuals, programming exercises (C, Python, Java), problem sets, and lab guides."
    />
  );
}
