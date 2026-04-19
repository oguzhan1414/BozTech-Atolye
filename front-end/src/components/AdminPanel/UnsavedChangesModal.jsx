import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

function UnsavedChangesModal({
  isOpen,
  message,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content unsaved-modal" onClick={(event) => event.stopPropagation()}>
        <div className="unsaved-modal-header">
          <span className="unsaved-modal-icon" aria-hidden="true">
            <FiAlertTriangle />
          </span>
          <div>
            <h3>Kaydedilmemis Degisiklikler</h3>
            <p>{message || 'Bu sayfada kaydedilmemis degisiklikler var.'}</p>
          </div>
        </div>

        <div className="form-actions unsaved-modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Kal
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Ayril
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnsavedChangesModal;
