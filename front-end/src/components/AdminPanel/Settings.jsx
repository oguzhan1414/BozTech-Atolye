import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSave, FiSettings, FiUser, FiShield, FiLogOut, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../../services/authService';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const resolveTabFromQuery = (search) => {
    const queryTab = new URLSearchParams(search).get('tab');
    return ['profile', 'session', 'security'].includes(queryTab) ? queryTab : 'profile';
  };
  const temporaryPassword = sessionStorage.getItem('tempLoginPassword') || '';

  const [activeTab, setActiveTab] = useState(() => resolveTabFromQuery(location.search));
  const [savedName, setSavedName] = useState(localStorage.getItem('userName') || 'Yonetici');
  const [profileName, setProfileName] = useState(savedName);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileDirty = useMemo(() => profileName.trim() !== savedName.trim(), [profileName, savedName]);
  const passwordDirty = useMemo(() => {
    return Boolean(
      passwordForm.currentPassword
      || passwordForm.newPassword
      || passwordForm.confirmPassword
    );
  }, [passwordForm]);
  const isDirty = profileDirty || passwordDirty;
  const {
    isWarningOpen,
    message,
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isDirty, 'Kaydedilmemis ayar degisiklikleri var. Ayrilirsaniz degisiklikler kaybolacak.');

  const roleLabel = localStorage.getItem('userRole') === 'admin' ? 'Super Admin' : 'Editor';
  const hasActiveSession = Boolean(localStorage.getItem('token'));
  const mustChangePassword = localStorage.getItem('userMustChangePassword') === 'true';

  useEffect(() => {
    const tabFromQuery = resolveTabFromQuery(location.search);
    setActiveTab((prev) => (prev === tabFromQuery ? prev : tabFromQuery));
  }, [location.search]);

  useEffect(() => {
    if (!mustChangePassword) return;
    if (!temporaryPassword) return;

    setPasswordForm((prev) => ({
      ...prev,
      currentPassword: prev.currentPassword || temporaryPassword,
    }));
  }, [mustChangePassword, temporaryPassword]);

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    requestConfirmation(() => {
      setActiveTab(nextTab);
      navigate(`/admin/panel/settings?tab=${nextTab}`, { replace: true });
    });
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

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Tum sifre alanlarini doldurun.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Yeni sifre en az 6 karakter olmali.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Yeni sifreler birbiriyle ayni degil.' });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setFeedback({ type: 'error', message: 'Yeni sifre mevcut sifre ile ayni olamaz.' });
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      localStorage.setItem('userMustChangePassword', 'false');
      sessionStorage.removeItem('tempLoginPassword');
      setFeedback({ type: 'success', message: 'Sifreniz basariyla degistirildi.' });
    } catch (apiError) {
      setFeedback({ type: 'error', message: apiError?.message || 'Sifre degistirilirken bir hata olustu.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userMustChangePassword');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Ayarlar</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={activeTab !== 'profile' || !profileDirty}>
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
            <li className={activeTab === 'security' ? 'active' : ''} onClick={() => handleTabChange('security')}>
              <FiLock /> Sifre
            </li>
          </ul>
        </div>

        <div className="settings-content">
          <div className="settings-header">
            <h3>
              {activeTab === 'profile' ? 'Profil Ayarlari' : activeTab === 'session' ? 'Oturum Ayarlari' : 'Sifre Degistir'}
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
            ) : activeTab === 'session' ? (
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
            ) : (
              <form className="settings-form" onSubmit={handleChangePassword}>
                {mustChangePassword ? (
                  <div className="admin-feedback error" style={{ marginBottom: '14px' }}>
                    <span>Bu hesap gecici sifre ile acildi. Lutfen sifrenizi hemen degistirin.</span>
                  </div>
                ) : null}
                <div className="settings-note-card">
                  <FiLock />
                  <p>Guvenliginiz icin duzenli sifre degisikligi yapin.</p>
                </div>

                <div className="form-group">
                  <label>Mevcut Sifre</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                      required
                      disabled={changingPassword}
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      aria-label="Mevcut sifreyi goster/gizle"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {mustChangePassword && temporaryPassword ? (
                    <small className="settings-helper-text">Mevcut sifre alanina gecici sifre otomatik getirildi.</small>
                  ) : null}
                </div>

                <div className="form-group">
                  <label>Yeni Sifre</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                      minLength={6}
                      required
                      disabled={changingPassword}
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      aria-label="Yeni sifreyi goster/gizle"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Yeni Sifre (Tekrar)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                      minLength={6}
                      required
                      disabled={changingPassword}
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      aria-label="Yeni sifre tekrarini goster/gizle"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: 0 }}>
                  <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                    {changingPassword ? 'Degistiriliyor...' : 'Sifreyi Degistir'}
                  </button>
                </div>
              </form>
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