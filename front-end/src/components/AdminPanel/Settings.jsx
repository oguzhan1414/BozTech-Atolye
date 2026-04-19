import React, { useState } from 'react';
import { FiSave, FiSettings, FiBell, FiLock, FiGlobe, FiMail } from 'react-icons/fi';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteTitle: 'Tech Club',
      siteDescription: 'Üniversitemizin en aktif teknoloji topluluğu',
      contactEmail: 'info@techclub.com',
      language: 'tr',
      timezone: 'Europe/Istanbul'
    },
    notifications: {
      emailNotifications: true,
      newUserAlert: true,
      newAnnouncementAlert: true,
      newEventAlert: true,
      dailySummary: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordPolicy: 'medium',
      loginAttempts: '5'
    }
  });
  const {
    isWarningOpen,
    message,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isDirty, 'Kaydedilmemis ayar degisiklikleri var. Ayrilirsaniz degisiklikler kaybolacak.');

  const updateSetting = (section, key, value) => {
    setIsDirty(true);
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    setIsDirty(false);
    alert('Ayarlar kaydedildi!');
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="settings-form">
            <div className="form-group">
              <label>Site Başlığı</label>
              <input 
                type="text" 
                value={settings.general.siteTitle}
                onChange={(e) => updateSetting('general', 'siteTitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Site Açıklaması</label>
              <textarea 
                rows="3"
                value={settings.general.siteDescription}
                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>İletişim E-postası</label>
              <input 
                type="email" 
                value={settings.general.contactEmail}
                onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Dil</label>
                <select 
                  value={settings.general.language}
                  onChange={(e) => updateSetting('general', 'language', e.target.value)}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="form-group">
                <label>Saat Dilimi</label>
                <select 
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                >
                  <option value="Europe/Istanbul">İstanbul</option>
                  <option value="Europe/London">Londra</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                />
                E-posta Bildirimleri
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.newUserAlert}
                  onChange={(e) => updateSetting('notifications', 'newUserAlert', e.target.checked)}
                />
                Yeni Kullanıcı Uyarısı
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.newAnnouncementAlert}
                  onChange={(e) => updateSetting('notifications', 'newAnnouncementAlert', e.target.checked)}
                />
                Yeni Duyuru Uyarısı
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.newEventAlert}
                  onChange={(e) => updateSetting('notifications', 'newEventAlert', e.target.checked)}
                />
                Yeni Etkinlik Uyarısı
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.dailySummary}
                  onChange={(e) => updateSetting('notifications', 'dailySummary', e.target.checked)}
                />
                Günlük Özet
              </label>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                />
                İki Faktörlü Doğrulama
              </label>
            </div>
            <div className="form-group">
              <label>Oturum Zaman Aşımı (dakika)</label>
              <input 
                type="number" 
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Şifre Politikası</label>
              <select 
                value={settings.security.passwordPolicy}
                onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
              >
                <option value="low">Düşük (6 karakter)</option>
                <option value="medium">Orta (8 karakter, 1 büyük harf)</option>
                <option value="high">Yüksek (10 karakter, büyük-küçük, rakam, özel)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Maksimum Giriş Denemesi</label>
              <input 
                type="number" 
                value={settings.security.loginAttempts}
                onChange={(e) => updateSetting('security', 'loginAttempts', e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Ayarlar</h2>
        <button className="btn btn-primary" onClick={handleSave}>
          <FiSave /> Kaydet
        </button>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <ul>
            <li className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
              <FiSettings /> Genel
            </li>
            <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
              <FiBell /> Bildirimler
            </li>
            <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
              <FiLock /> Güvenlik
            </li>
            <li className={activeTab === 'email' ? 'active' : ''} onClick={() => setActiveTab('email')}>
              <FiMail /> E-posta
            </li>
            <li className={activeTab === 'seo' ? 'active' : ''} onClick={() => setActiveTab('seo')}>
              <FiGlobe /> SEO
            </li>
          </ul>
        </div>

        <div className="settings-content">
          <div className="settings-header">
            <h3>
              {activeTab === 'general' && 'Genel Ayarlar'}
              {activeTab === 'notifications' && 'Bildirim Ayarları'}
              {activeTab === 'security' && 'Güvenlik Ayarları'}
              {activeTab === 'email' && 'E-posta Ayarları'}
              {activeTab === 'seo' && 'SEO Ayarları'}
            </h3>
          </div>
          <div className="settings-body">
            {renderTab()}
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