import { Check, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, type = 'success' }: ToastProps) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {type === 'success' && <Check size={16} />}
      {type === 'error' && <AlertCircle size={16} />}
      {type === 'info' && <Info size={16} />}
      <span>{message}</span>
    </div>
  );
}
