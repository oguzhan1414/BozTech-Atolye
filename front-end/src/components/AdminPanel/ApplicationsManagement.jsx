import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheck, FiX, FiClock, FiMail, FiEye, FiUser, FiPhone, FiBook, FiFileText } from 'react-icons/fi';
import { applicationService } from '../../services/applicationService';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

const statusBadge = (status) => {
  const map = {
    pending:   { label: 'Bekliyor',   bg: '#fef3c7', color: '#d97706' },
    interview: { label: 'Mülakat',    bg: '#fef3c7', color: '#f59e0b' },
    approved:  { label: 'Onaylandı', bg: '#d1fae5', color: '#10b981' },
    rejected:  { label: 'Reddedildi',bg: '#fee2e2', color: '#ef4444' },
  };
  const s = map[status] || { label: status, bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ padding: '4px 10px', borderRadius: '6px', background: s.bg, color: s.color, fontWeight: 'bold', fontSize: '13px' }}>
      {s.label}
    </span>
  );
};

function DetailModal({ app, onClose, onStatusUpdate, onMailClick }) {
  if (!app) return null;

  const field = (label, value) => value ? (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>{value}</div>
    </div>
  ) : null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

        {/* Modal Header */}
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9' }}>{app.firstName} {app.lastName}</div>
            <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{app.email}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {statusBadge(app.status)}
            <button onClick={onClose} style={{ background: '#334155', border: 'none', borderRadius: '8px', width: '36px', height: '36px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px' }}>

          {/* Kişisel Bilgiler */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser size={14} /> Kişisel Bilgiler
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              {field('Öğrenci No', app.studentNumber)}
              {field('Telefon', app.phone)}
              {field('Fakülte', app.faculty)}
              {field('Bölüm', app.department)}
              {field('Sınıf', app.grade)}
              {field('Başvuru Tarihi', new Date(app.appliedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }))}
            </div>
          </div>

          {/* Motivasyon */}
          <div style={{ marginBottom: '20px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText size={14} /> Neden BozTech?
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>{app.motivation || '—'}</p>
          </div>

          {/* Deneyim */}
          <div style={{ padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBook size={14} /> Teknik Deneyim & Projeler
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>{app.experience || '—'}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid #334155', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {app.status === 'pending' && (
            <button onClick={() => { onStatusUpdate(app._id, 'interview'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              <FiClock size={15} /> Mülakata Çağır
            </button>
          )}
          {(app.status === 'pending' || app.status === 'interview') && (
            <>
              <button onClick={() => { onStatusUpdate(app._id, 'approved'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                <FiCheck size={15} /> Onayla
              </button>
              <button onClick={() => { onStatusUpdate(app._id, 'rejected'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                <FiX size={15} /> Reddet
              </button>
            </>
          )}
          <button onClick={() => { onClose(); onMailClick(app); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            <FiMail size={15} /> Mail Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplicationsManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detailApp, setDetailApp] = useState(null);

  const [mailModalApp, setMailModalApp] = useState(null);
  const [mailData, setMailData] = useState({ subject: '', message: '' });
  const [sendingMail, setSendingMail] = useState(false);
  const isMailDirty = Boolean(mailModalApp) && Boolean(mailData.subject.trim() || mailData.message.trim());
  const { isWarningOpen, message, requestConfirmation, handleCancelLeave, handleConfirmLeave } = useUnsavedChangesPrompt(isMailDirty, 'Yazdiginiz e-posta kaydedilmedi. Ayrilirsaniz metin kaybolacak.');
  const { toast, showToast, hideToast } = useToast();

  const handleCloseMailModal = () => {
    requestConfirmation(() => {
      setMailModalApp(null);
      setMailData({ subject: '', message: '' });
    });
  };

  useEffect(() => { fetchApplications(); }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const res = await applicationService.getAll(params);
      if (res.success) setApplications(res.data);
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
        const labels = { approved: 'Başvuru onaylandı.', rejected: 'Başvuru reddedildi.', interview: 'Mülakata davet edildi.' };
        showToast(labels[newStatus] || 'Durum güncellendi.');
      }
    } catch {
      showToast('Durum güncellenirken hata oluştu.', 'error');
    }
  };

  const handleMailClick = (app) => {
    setMailModalApp(app);
    setMailData({ subject: '', message: '' });
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mailData.subject || !mailData.message) { alert('Lütfen konu ve mesaj alanlarını doldurun.'); return; }
    setSendingMail(true);
    try {
      await applicationService.sendEmail(mailModalApp._id, mailData.subject, mailData.message);
      showToast('Mail başarıyla gönderildi.');
      setMailModalApp(null);
      setMailData({ subject: '', message: '' });
    } catch {
      showToast('Mail gönderiminde hata oluştu.', 'error');
    } finally {
      setSendingMail(false);
    }
  };

  const filterButtons = [
    { value: '',          label: 'Tümü',               activeColor: '#3b82f6' },
    { value: 'pending',   label: 'Bekleyenler',         activeColor: '#d97706' },
    { value: 'interview', label: 'Mülakata Çağrılanlar',activeColor: '#f59e0b' },
    { value: 'approved',  label: 'Onaylananlar',        activeColor: '#10b981' },
    { value: 'rejected',  label: 'Reddedilenler',       activeColor: '#ef4444' },
  ];

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2>Tüm Başvurular Havuzu</h2>
          <p style={{ color: '#64748b' }}>Satıra tıklayarak başvuru detaylarını görüntüleyebilirsiniz.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filterButtons.map(btn => (
            <button key={btn.value} onClick={() => setFilter(btn.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === btn.value ? btn.activeColor : '#f1f5f9', color: filter === btn.value ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}>
              {btn.label}
            </button>
          ))}
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
                <th style={{ padding: '16px' }}>Fakülte / Sınıf</th>
                <th style={{ padding: '16px' }}>Tarih</th>
                <th style={{ padding: '16px' }}>Durum</th>
                <th style={{ padding: '16px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr
                  key={app._id}
                  onClick={() => setDetailApp(app)}
                  style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px' }}>
                    <strong>{app.firstName} {app.lastName}</strong>
                    <br /><small style={{ color: '#64748b' }}>{app.email}</small>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {app.faculty}
                    <br /><small style={{ color: '#64748b' }}>{app.grade}</small>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{new Date(app.appliedAt).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '16px' }}>{statusBadge(app.status)}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setDetailApp(app)} title="Detayları Gör" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEye size={16} /></button>
                      {app.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(app._id, 'interview')} title="Mülakata Çağır" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiClock size={16} /></button>
                      )}
                      {(app.status === 'pending' || app.status === 'interview') && (
                        <>
                          <button onClick={() => handleStatusUpdate(app._id, 'approved')} title="Onayla" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={16} /></button>
                          <button onClick={() => handleStatusUpdate(app._id, 'rejected')} title="Reddet" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
                        </>
                      )}
                      <button onClick={() => handleMailClick(app)} title="Özel Mail Gönder" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMail size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Seçili sekmeye uygun başvuru bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAY MODALI */}
      <DetailModal
        app={detailApp}
        onClose={() => setDetailApp(null)}
        onStatusUpdate={handleStatusUpdate}
        onMailClick={handleMailClick}
      />

      {/* MAİL GÖNDERME MODALI */}
      {mailModalApp && (
        <div onClick={handleCloseMailModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '36px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={handleCloseMailModal} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiX size={20} />
            </button>
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>Özel Mail Gönder</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Alıcı: <strong>{mailModalApp.firstName} {mailModalApp.lastName}</strong> ({mailModalApp.email})</p>
            </div>
            <form onSubmit={handleSendMail}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Konu Başlığı</label>
                <input type="text" value={mailData.subject} onChange={e => setMailData({ ...mailData, subject: e.target.value })} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} placeholder="BozTech Mülakat Daveti..." />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Mesajınız</label>
                <textarea value={mailData.message} onChange={e => setMailData({ ...mailData, message: e.target.value })} required rows="5" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Merhaba, başvurunuzla ilgili olarak..." />
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

      <UnsavedChangesModal isOpen={isWarningOpen} message={message} onCancel={handleCancelLeave} onConfirm={handleConfirmLeave} />
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default ApplicationsManagement;
