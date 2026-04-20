import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiSettings, FiUser, FiShield, FiLogOut } from 'react-icons/fi';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [savedName, setSavedName] = useState(localStorage.getItem('userName') || 'Yonetici');
  const [profileName, setProfileName] = useState(savedName);
  const [feedback, setFeedback] = useState(null);

  const isDirty = useMemo(() => profileName.trim() !== savedName.trim(), [profileName, savedName]);
  const {
    isWarningOpen,
    message,
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isDirty, 'Kaydedilmemis ayar degisiklikleri var. Ayrilirsaniz degisiklikler kaybolacak.');

  const roleLabel = localStorage.getItem('userRole') === 'admin' ? 'Super Admin' : 'Editor';
  const hasActiveSession = Boolean(localStorage.getItem('token'));

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    requestConfirmation(() => setActiveTab(nextTab));
  };

  const handleSave = () => {
    const normalizedName = profileName.trim() || 'Yonetici';

    localStorage.setItem('userName', normalizedName);
    setSavedName(normalizedName);
    setProfileName(normalizedName);
    setFeedback({ type: 'success', message: 'Ayarlar kaydedildi.' });

    window.dispatchEvent(new CustomEvent('admin-profile-updated', {
      detail: { name: normalizedName },
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Ayarlar</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={activeTab !== 'profile' || !isDirty}>
          <FiSave /> Kaydet
        </button>
      </div>

      {feedback ? (
        <div className={`admin-feedback ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Bildirimi kapat">×</button>
        </div>
      ) : null}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <ul>
            <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => handleTabChange('profile')}>
              <FiUser /> Profil
            </li>
            <li className={activeTab === 'session' ? 'active' : ''} onClick={() => handleTabChange('session')}>
              <FiShield /> Oturum
            </li>
          </ul>
        </div>

        <div className="settings-content">
          <div className="settings-header">
            <h3>
              {activeTab === 'profile' ? 'Profil Ayarlari' : 'Oturum Ayarlari'}
            </h3>
          </div>
          <div className="settings-body">
            {activeTab === 'profile' ? (
              <div className="settings-form">
                <div className="settings-note-card">
                  <FiSettings />
                  <p>Bu sayfa sadeleştirildi. Sadece aktif çalışan ayarlar tutuldu.</p>
                </div>

                <div className="form-group">
                  <label>Panelde Gorunen Ad</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setFeedback(null);
                    }}
                    placeholder="Yonetici"
                    maxLength={60}
                  />
                  <small className="settings-helper-text">Kaydedildiginde sol menu ve ust profil alaninda guncellenir.</small>
                </div>

                <div className="settings-info-grid">
                  <div className="settings-info-item">
                    <span>Rol</span>
                    <strong>{roleLabel}</strong>
                  </div>
                  <div className="settings-info-item">
                    <span>Oturum</span>
                    <strong>{hasActiveSession ? 'Acik' : 'Kapali'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="settings-form">
                <div className="settings-note-card">
                  <FiShield />
                  <p>Aktif oturumu guvenli sekilde kapatmak icin cikis yapabilirsiniz.</p>
                </div>
                <div className="form-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                  <button type="button" className="btn btn-danger" onClick={handleLogout}>
                    <FiLogOut /> Cikis Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={isWarningOpen}
        message={message}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}

export default Settings;