import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiBell, 
  FiCalendar, 
  FiImage,
  FiEye,
  FiUserPlus,
  FiClock,
  FiCheck,
  FiX,
  FiMail
} from 'react-icons/fi';
import { applicationService } from '../../services/applicationService';
import { announcementService } from '../../services/announcementService';
import { eventService } from '../../services/eventService';
import { photoService } from '../../services/photoService';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 15420,
    todayVisitors: 342,
    totalAnnouncements: 0,
    totalEvents: 0,
    totalPhotos: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [mailModalApp, setMailModalApp] = useState(null);
  const [mailData, setMailData] = useState({ subject: '', message: '' });
  const [sendingMail, setSendingMail] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'viewer';
  const storedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');

  const canAccess = (permission) => {
    if (userRole === 'admin') return true;
    if (!permission) return true;
    return Boolean(storedPermissions?.[permission]);
  };

  const canApplications = canAccess('applications');
  const canAnnouncements = canAccess('announcements');
  const canEvents = canAccess('events');
  const canPhotos = canAccess('photos');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Tüm verileri paralel çek (yetkisi olmayanlarda çökmemesi için catch eklendi)
      const [appsRes, announcementsRes, eventsRes, photosRes] = await Promise.all([
        canApplications
          ? applicationService.getAll({ status: 'pending', limit: 8, sort: '-appliedAt' }).catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
        canAnnouncements
          ? announcementService.getAll().catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
        canEvents
          ? eventService.getAll({ limit: 1 }).catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
        canPhotos
          ? photoService.getAll({ limit: 1 }).catch(() => ({ success: false }))
          : Promise.resolve({ success: false })
      ]);

      // Başvurular
      if (appsRes.success) {
        // API'den gelen veriyi recentApplications formatına çevir
        const formattedApps = (appsRes.data || []).map(app => ({
          id: app._id,
          name: `${app.firstName} ${app.lastName}`,
          department: app.department,
          faculty: app.faculty || 'Bilinmiyor',
          grade: app.grade || 'Bilinmiyor',
          email: app.email,
          phone: app.phone,
          motivation: app.motivation || '-',
          experience: app.experience || '-',
          date: new Date(app.appliedAt).toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short' 
          }),
          fullDate: new Date(app.appliedAt).toLocaleString('tr-TR'),
          status: app.status
        }));
        
        setRecentApplications(formattedApps);
        
        setStats(prev => ({
          ...prev,
          totalApplications: appsRes.stats?.total || appsRes.count || 0,
          pendingApplications: appsRes.stats?.pending || 
            appsRes.data?.filter(a => a.status === 'pending').length || 0
        }));
      }

      // Duyurular
      if (announcementsRes.success) {
        setStats(prev => ({ 
          ...prev, 
          totalAnnouncements: announcementsRes.count || 0 
        }));
      }

      // Etkinlikler
      if (eventsRes.success) {
        setStats(prev => ({ 
          ...prev, 
          totalEvents: eventsRes.count || 0 
        }));
      }

      // Fotoğraflar
      if (photosRes.success) {
        setStats(prev => ({ 
          ...prev, 
          totalPhotos: photosRes.count || 0 
        }));
      }

    } catch (error) {
      console.error('Dashboard verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hızlı işlem yönlendirmeleri
  const handleQuickAction = (path) => {
    navigate(path);
  };

  const handleStatusUpdate = async (e, id, newStatus) => {
    e?.stopPropagation();
    try {
      const res = await applicationService.updateStatus(id, newStatus);
      if (res.success) {
        setRecentApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        fetchDashboardData(); // Update badges behind the scenes
      }
    } catch (err) {
      alert("Durum güncellenirken hata oluştu.");
    }
  };

  const handleMailClick = (e, app) => {
    e?.stopPropagation();
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
      await applicationService.sendEmail(mailModalApp.id, mailData.subject, mailData.message);
      alert("Mail başarıyla gönderildi!");
      setMailModalApp(null);
    } catch (err) {
      console.error(err);
      alert("Mail gönderilirken bir hata oluştu. SMTP ayarlarınızı kontrol edin.");
    } finally {
      setSendingMail(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard">
      {/* Özet Kartlar */}
      <div className="stats-grid">
        {canApplications ? (
          <div className="stat-card">
            <div className="stat-icon green">
              <FiUserPlus />
            </div>
            <div className="stat-content">
              <span className="stat-label">Toplam Başvuru</span>
              <span className="stat-value">{stats.totalApplications}</span>
              <span className="stat-pending">Bekleyen: {stats.pendingApplications}</span>
            </div>
          </div>
        ) : null}

        {canAnnouncements ? (
          <div className="stat-card">
            <div className="stat-icon purple">
              <FiBell />
            </div>
            <div className="stat-content">
              <span className="stat-label">Duyurular</span>
              <span className="stat-value">{stats.totalAnnouncements}</span>
            </div>
          </div>
        ) : null}

        {canEvents ? (
          <div className="stat-card">
            <div className="stat-icon orange">
              <FiCalendar />
            </div>
            <div className="stat-content">
              <span className="stat-label">Etkinlikler</span>
              <span className="stat-value">{stats.totalEvents}</span>
            </div>
          </div>
        ) : null}

        {canPhotos ? (
          <div className="stat-card">
            <div className="stat-icon pink">
              <FiImage />
            </div>
            <div className="stat-content">
              <span className="stat-label">Fotoğraflar</span>
              <span className="stat-value">{stats.totalPhotos}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Son Başvurular */}
      {canApplications ? (
      <div className="recent-section">
        <div className="section-header">
          <h3>📋 Son Başvurular</h3>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/panel/applications')}
          >
            Tümü
          </button>
        </div>
        
        <div className="application-list">
          {recentApplications.length === 0 ? (
            <p className="text-muted">Henüz başvuru yok</p>
          ) : (
            recentApplications.map((app) => (
              <div 
                key={app.id} 
                className="application-item"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}
              >
                <div className="app-info" style={{ flex: 1 }}>
                  <strong>{app.name}</strong>
                  <span>{app.department}</span>
                  <small>{app.date}</small>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="app-status" style={{ marginRight: '10px' }}>
                    {app.status === 'pending' ? (
                      <span className="badge pending">Bekliyor</span>
                    ) : app.status === 'approved' ? (
                      <span className="badge approved">Onaylandı</span>
                    ) : (
                      <span className="badge rejected">Reddedildi</span>
                    )}
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <button 
                    className="action-btn view-btn" 
                    title="İncele"
                    onClick={() => setSelectedApp(app)}
                    style={{ background: 'rgba(100,116,139,0.1)', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiEye size={18} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Mülakata Çağır"
                    onClick={(e) => handleStatusUpdate(e, app.id, 'interview')}
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiClock size={18} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Onayla"
                    onClick={(e) => handleStatusUpdate(e, app.id, 'approved')}
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiCheck size={18} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Reddet"
                    onClick={(e) => handleStatusUpdate(e, app.id, 'rejected')}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiX size={18} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Mail Gönder"
                    onClick={(e) => handleMailClick(e, app)}
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiMail size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      ) : null}

      {/* Hızlı İşlemler */}
      <div className="quick-actions">
        <div className="section-header">
          <h3>⚡ Hızlı İşlemler</h3>
        </div>
        <div className="actions-grid">
          {canAnnouncements ? (
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('/admin/panel/announcements')}
            >
              + Yeni Duyuru
            </button>
          ) : null}
          {canEvents ? (
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('/admin/panel/events')}
            >
              + Yeni Etkinlik
            </button>
          ) : null}
          {canPhotos ? (
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('/admin/panel/photos')}
            >
              📷 Fotoğraf Yükle
            </button>
          ) : null}
          {canApplications ? (
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('/admin/panel/applications')}
            >
              📊 Basvurulari Incele
            </button>
          ) : null}
          {!canApplications && !canAnnouncements && !canEvents && !canPhotos ? (
            <p className="text-muted">Bu hesap icin tanimli hizli islem bulunmuyor.</p>
          ) : null}
        </div>
      </div>

      {/* MAİL GÖNDERME MODALI */}
      {canApplications && mailModalApp && (
        <div className="modal-overlay" onClick={() => setMailModalApp(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '36px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <button onClick={() => setMailModalApp(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}>
              <FiX size={20} />
            </button>
            
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
               <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>Özel Mail Gönder</h2>
               <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Alıcı: <strong>{mailModalApp.name}</strong> ({mailModalApp.email})</p>
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

      {/* BAŞVURU DETAY MODALI */}
      {canApplications && selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '36px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <button onClick={() => setSelectedApp(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}>
              <FiX size={20} />
            </button>
            
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
               <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 12px 0' }}>{selectedApp.name}</h2>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className={`badge ${selectedApp.status}`}>{selectedApp.status.toUpperCase()}</span>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>{selectedApp.fullDate}</span>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                 <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>İLETİŞİM BİLGİLERİ</p>
                 <p style={{ margin: '0 0 8px 0', color: '#334155' }}><strong>Email:</strong> <a href={`mailto:${selectedApp.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{selectedApp.email}</a></p>
                 <p style={{ margin: '0', color: '#334155' }}><strong>Telefon:</strong> {selectedApp.phone}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                 <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>AKADEMİK BİLGİLER</p>
                 <p style={{ margin: '0 0 8px 0', color: '#334155' }}><strong>No:</strong> {selectedApp.studentNumber}</p>
                 <p style={{ margin: '0 0 8px 0', color: '#334155' }}><strong>Bölüm:</strong> {selectedApp.department}</p>
                 <p style={{ margin: '0 0 8px 0', color: '#334155' }}><strong>Sınıf:</strong> {selectedApp.grade}</p>
                 <p style={{ margin: '0', color: '#334155' }}><strong>Fakülte:</strong> {selectedApp.faculty}</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
               <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>MOTİVASYON (NEDEN BOZTECH?)</p>
               <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', fontSize: '15px' }}>{selectedApp.motivation}</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
               <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>TEKNİK DENEYİMLER & PROJELER</p>
               <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', fontSize: '15px' }}>{selectedApp.experience}</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
               <button onClick={(e) => { handleStatusUpdate(e, selectedApp.id, 'approved'); setSelectedApp(null); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>Onayla</button>
               <button onClick={(e) => { handleStatusUpdate(e, selectedApp.id, 'rejected'); setSelectedApp(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>Reddet</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;