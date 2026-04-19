import { useContext, useEffect, useRef, useState } from 'react';
import { UNSAFE_NavigationContext, useBeforeUnload } from 'react-router-dom';

export function useUnsavedChangesPrompt(isDirty, message) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const pendingTxRef = useRef(null);
  const pendingActionRef = useRef(null);
  const unblockRef = useRef(null);

  useEffect(() => {
    if (!isDirty) return undefined;
    if (!navigator || typeof navigator.block !== 'function') return undefined;

    const unblock = navigator.block((tx) => {
      if (pendingTxRef.current || pendingActionRef.current) return;
      pendingTxRef.current = tx;
      setIsWarningOpen(true);
    });

    unblockRef.current = unblock;

    return () => {
      unblock();
      if (unblockRef.current === unblock) {
        unblockRef.current = null;
      }
    };
  }, [isDirty, navigator]);

  useBeforeUnload((event) => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  const requestConfirmation = (action) => {
    if (!isDirty) {
      action();
      return;
    }

    pendingActionRef.current = action;
    setIsWarningOpen(true);
  };

  const handleCancelLeave = () => {
    pendingTxRef.current = null;
    pendingActionRef.current = null;
    setIsWarningOpen(false);
  };

  const handleConfirmLeave = () => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setIsWarningOpen(false);
      action();
      return;
    }

    if (pendingTxRef.current) {
      const tx = pendingTxRef.current;
      const unblock = unblockRef.current;
      pendingTxRef.current = null;
      if (unblock) {
        unblock();
        unblockRef.current = null;
      }
      setIsWarningOpen(false);
      tx.retry();
      return;
    }

    setIsWarningOpen(false);
  };

  return {
    isWarningOpen,
    message: message || 'Kaydedilmemis degisiklikler var. Bu sayfadan ayrilmak istiyor musunuz?',
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  };
}
