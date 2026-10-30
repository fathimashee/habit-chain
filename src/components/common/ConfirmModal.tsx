import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal title={title} eyebrow="Confirmation" onClose={onClose} maxWidth="420px">
      <div className="confirm-modal-body">
        <div className={`confirm-icon-box ${isDestructive ? 'destructive' : 'neutral'}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="outline-button"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={isDestructive ? 'danger-button' : 'primary-button'}
            onClick={() => void onConfirm()}
            disabled={busy}
          >
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
