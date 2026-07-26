import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Konfirmasi Hapus',
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1070 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-body text-center p-4">
            <div
              className={`badge bg-${type}-subtle text-${type} rounded-circle p-3 mb-3 d-inline-flex align-items-center justify-content-center`}
              style={{ width: '60px', height: '60px' }}
            >
              <i className={`bi ${type === 'danger' ? 'bi-trash3-fill' : 'bi-exclamation-triangle-fill'} fs-3`}></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">{title}</h5>
            <p className="text-muted small mb-4">{message}</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light rounded-3 px-4 fw-medium"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-${type} rounded-3 px-4 fw-semibold shadow-sm`}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
