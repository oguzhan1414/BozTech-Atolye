import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  itemName,
  onCancel,
  onConfirm,
  loading = false
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <span className="confirm-modal-icon" aria-hidden="true">
            <FiAlertTriangle />
          </span>
          <div>
            <h3>{title || 'Kalici Silme Onayi'}</h3>
            <p>{message || 'Bu islem geri alinamaz. Silinen veri veritabanindan kalici olarak kaldirilir.'}</p>
          </div>
        </div>

        {itemName ? (
          <div className="confirm-item-name">
            <strong>Silinecek kayit:</strong> {itemName}
          </div>
        ) : null}

        <div className="form-actions confirm-modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Vazgec
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Siliniyor...' : 'Evet, Kalici Sil'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
