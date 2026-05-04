import React, { useEffect, useState } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const colors = isSuccess
    ? { bg: '#052e16', border: '#16a34a', icon: '#4ade80', text: '#bbf7d0' }
    : { bg: '#2d0a0a', border: '#dc2626', icon: '#f87171', text: '#fecaca' };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        minWidth: '260px',
        maxWidth: '360px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      <div style={{ color: colors.icon, marginTop: '1px', flexShrink: 0 }}>
        {isSuccess ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
      </div>
      <span style={{ color: colors.text, fontSize: '14px', lineHeight: '1.5', flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', padding: '0', opacity: 0.7, flexShrink: 0 }}
      >
        <FiX size={16} />
      </button>
    </div>
  );
}

export default Toast;
