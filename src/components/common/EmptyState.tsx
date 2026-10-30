import { type ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon ?? <Search size={28} />}
      </div>
      <strong>{title}</strong>
      <span>{text}</span>
      {action && (
        <button
          type="button"
          className="primary-button empty-state-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
