import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheck, FiX, FiClock, FiMail } from 'react-icons/fi';
import { applicationService } from '../../services/applicationService';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

function ApplicationsManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Mail modal states
  const [mailModalApp, setMailModalApp] = useState(null);
  const [mailData, setMailData] = useState({ subject: '', message: '' });
  const [sendingMail, setSendingMail] = useState(false);
  const isMailDirty = Boolean(mailModalApp) && Boolean(mailData.subject.trim() || mailData.message.trim());
  const {
    isWarningOpen,
    message,
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isMailDirty, 'Yazdiginiz e-posta kaydedilmedi. Ayrilirsaniz metin kaybolacak.');

  const handleCloseMailModal = () => {
    requestConfirmation(() => {
      setMailModalApp(null);
      setMailData({ subject: '', message: '' });
    });
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const res = await applicationService.getAll(params);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (error) {
      console.error('Başvurular yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await applicationService.updateStatus(id, newStatus);
      if (res.success) {
        fetchApplications();
      }
    } catch (err) {
      alert("Durum güncellenirken hata oluştu.");
    }
  };

  const handleMailClick = (app) => {
    setMailModalApp(app);
    setMailData({ subject: '', message: '' });
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mailData.subject || !mailData.message) {
      alert("Lütfen konu ve mesaj alanlarını doldurun.");
      return;
    }
    setSendingMail(true);
    try {
      await applicationService.sendEmail(mailModalApp._id, mailData.subject, mailData.message);
      alert("Mail başarıyla gönderildi!");
      setMailModalApp(null);
      setMailData({ subject: '', message: '' });
    } catch (err) {
      console.error(err);
      alert("Mail gönderiminde hata oluştu.");
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2>Tüm Başvurular Havuzu</h2>
          <p style={{ color: '#64748b' }}>Sistemdeki onaylanan, reddedilen ve mülakata çağrılan tüm kayıtları detaylı şekilde listeleyin.</p>
        </div>
        
        {/* TAB BUTONLARI (FİLTRELER) */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setFilter('')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === '' ? '#3b82f6' : '#f1f5f9', color: filter === '' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Tümü</button>
          <button onClick={() => setFilter('pending')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'pending' ? '#d97706' : '#f1f5f9', color: filter === 'pending' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Bekleyenler</button>
          <button onClick={() => setFilter('interview')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'interview' ? '#f59e0b' : '#f1f5f9', color: filter === 'interview' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Mülakata Çağrılanlar</button>
          <button onClick={() => setFilter('approved')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'approved' ? '#10b981' : '#f1f5f9', color: filter === 'approved' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Onaylananlar</button>
          <button onClick={() => setFilter('rejected')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'rejected' ? '#ef4444' : '#f1f5f9', color: filter === 'rejected' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Reddedilenler</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      ) : (
        <div className="table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px' }}>Ad Soyad</th>
                <th style={{ padding: '16px' }}>Kurum Detayları</th>
                <th style={{ padding: '16px' }}>Tarih</th>
                <th style={{ padding: '16px' }}>Durum</th>
                <th style={{ padding: '16px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px' }}>
                    <strong>{app.firstName} {app.lastName}</strong>
                    <br/><small className="text-muted" style={{ color: '#64748b' }}>{app.email}</small>
                  </td>
                  <td style={{ padding: '16px' }}>{app.faculty}<br/><small style={{ color: '#64748b' }}>{app.department}</small></td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{new Date(app.appliedAt).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '16px' }}>
                    {app.status === 'pending' && <span className="badge pending" style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '13px' }}>Bekliyor</span>}
                    {app.status === 'interview' && <span className="badge warning" style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>Mülakat</span>}
                    {app.status === 'approved' && <span className="badge approved" style={{ padding: '4px 8px', borderRadius: '4px', background: '#d1fae5', color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>Onaylandı</span>}
                    {app.status === 'rejected' && <span className="badge rejected" style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>Reddedildi</span>}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      
                      {/* SADECE BEKLEYENLERİ MÜLAKATA ÇAĞIRABİLİRSİN */}
                      {app.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(app._id, 'interview')} title="Mülakata Çağır" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiClock size={16} /></button>
                      )}

                      {/* SADECE BEKLEYENLER VEYA MÜLAKATA ÇAĞRILANLAR ONAYLANIP / REDDEDİLEBİLİR. ONAYLANMIŞ VEYA REDDEDİLMİŞ ADAMIN BUTONU GÖZÜKMEZ */}
                      {(app.status === 'pending' || app.status === 'interview') && (
                        <>
                          <button onClick={() => handleStatusUpdate(app._id, 'approved')} title="Onayla" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={16} /></button>
                          <button onClick={() => handleStatusUpdate(app._id, 'rejected')} title="Reddet" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
                        </>
                      )}

                      {/* MAİL ATMA BUTONU (GÜZEL OLAN) HERKESE AÇIK. RED KİŞİSİNE FARKLI KONUDA MAİL ATABİLİRSİN */}
                      <button onClick={() => handleMailClick(app)} title="Özel Mail Gönder" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMail size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                   <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Seçili sekmeye uygun arşiv bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MAİL GÖNDERME MODALI */}
      {mailModalApp && (
        <div className="modal-overlay" onClick={handleCloseMailModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '36px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <button onClick={handleCloseMailModal} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}>
              <FiX size={20} />
            </button>
            
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
               <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>Özel Mail Gönder</h2>
               <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Alıcı: <strong>{mailModalApp.firstName} {mailModalApp.lastName}</strong> ({mailModalApp.email})</p>
            </div>

            <form onSubmit={handleSendMail}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Konu Başlığı</label>
                <input type="text" value={mailData.subject} onChange={(e) => setMailData({...mailData, subject: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} placeholder="BozTech Mülakat Daveti..." />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Mesajınız</label>
                <textarea value={mailData.message} onChange={(e) => setMailData({...mailData, message: e.target.value})} required rows="5" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', resize: 'vertical' }} placeholder="Merhaba, başvurunuzla ilgili olarak..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={sendingMail} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: sendingMail ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {sendingMail ? 'Gönderiliyor...' : <><FiMail size={18} /> Gönder</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UnsavedChangesModal
        isOpen={isWarningOpen}
        message={message}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />

    </div>
  );
}

export default ApplicationsManagement;
