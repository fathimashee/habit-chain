import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

export function Modal({ eyebrow, title, children, onClose, maxWidth }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dialog-title"
        style={maxWidth ? { maxWidth } : undefined}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
          type="button"
        >
          <X size={18} />
        </button>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id="modal-dialog-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
