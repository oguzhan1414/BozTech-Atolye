import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { announcementService } from '../../services/announcementService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAllAdmin();
      if (response.success) setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error);
      setError('Duyurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => { setEditingAnnouncement(null); setShowModal(true); };
  const handleEdit = (announcement) => { setEditingAnnouncement(announcement); setShowModal(true); };

  const handleDeleteRequest = (announcement) => setDeleteTarget(announcement);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await announcementService.delete(deleteTarget._id);
      if (response.success) {
        setAnnouncements(prev => prev.filter(a => a._id !== deleteTarget._id));
        showToast('Duyuru kalıcı olarak silindi.');
      }
      setDeleteTarget(null);
    } catch (apiError) {
      console.error('Duyuru silinirken hata:', apiError);
      showToast('Duyuru silinirken bir hata oluştu.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingAnnouncement) {
        const response = await announcementService.update(editingAnnouncement._id, formData);
        if (response.success) {
          setAnnouncements(announcements.map(a => a._id === editingAnnouncement._id ? response.data : a));
          showToast('Duyuru güncellendi.');
        }
      } else {
        const response = await announcementService.create(formData);
        if (response.success) {
          setAnnouncements([response.data, ...announcements]);
          showToast('Duyuru oluşturuldu.');
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Duyuru kaydedilirken hata:', error);
      showToast('Duyuru kaydedilirken bir hata oluştu.', 'error');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('tr-TR');

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading && announcements.length === 0) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Duyuru Yönetimi</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Yeni Duyuru
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input type="text" placeholder="Duyuru ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-box">
          <FiFilter />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tüm Kategoriler</option>
            <option value="Teknik">Teknik</option>
            <option value="Genel">Genel</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tip</th>
              <th>Başlık</th>
              <th>Açıklama</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.length === 0 ? (
              <tr><td colSpan="7" className="text-center">Duyuru bulunamadı</td></tr>
            ) : (
              filteredAnnouncements.map(item => (
                <tr key={item._id}>
                  <td>#{item._id.slice(-4)}</td>
                  <td>
                    <span className={`badge badge-${item.type?.toLowerCase() || 'genel'}`}>{item.type || 'Genel'}</span>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.description?.substring(0, 50)}...</td>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <span className={`status-badge status-${item.isActive ? 'active' : 'inactive'}`}>
                      {item.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Düzenle">
                        <FiEdit2 />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(item)} title="Sil">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AnnouncementModal announcement={editingAnnouncement} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Duyuruyu Kalıcı Sil"
        message="Bu duyuruyu sildiğinizde veritabanından tamamen kaldırılır ve geri getirilemez."
        itemName={deleteTarget?.title}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

function AnnouncementModal({ announcement, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: announcement?.type === 'Teknik' ? 'Teknik' : 'Genel',
    title: announcement?.title || '',
    description: announcement?.description || '',
    isActive: announcement?.isActive !== undefined ? announcement.isActive : true
  });
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { isWarningOpen, message, requestConfirmation, handleCancelLeave, handleConfirmLeave } =
    useUnsavedChangesPrompt(isDirty, 'Kaydedilmemiş duyuru değişiklikleri var. Ayrılırsanız değişiklikler kaybolacak.');

  const handleFieldChange = (field, value) => { setIsDirty(true); setFormData(prev => ({ ...prev, [field]: value })); };
  const handleAttemptClose = () => requestConfirmation(() => { setIsDirty(false); onClose(); });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setIsDirty(false);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={handleAttemptClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{announcement ? 'Duyuru Düzenle' : 'Yeni Duyuru'}</h3>
          <button className="modal-close" onClick={handleAttemptClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Duyuru Tipi</label>
            <select value={formData.type} onChange={e => handleFieldChange('type', e.target.value)} required>
              <option value="Teknik">Teknik</option>
              <option value="Genel">Genel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Başlık</label>
            <input type="text" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Açıklama</label>
            <textarea rows="4" value={formData.description} onChange={e => handleFieldChange('description', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Durum</label>
            <select value={formData.isActive ? 'active' : 'inactive'} onChange={e => handleFieldChange('isActive', e.target.value === 'active')}>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleAttemptClose}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
      <UnsavedChangesModal isOpen={isWarningOpen} message={message} onCancel={handleCancelLeave} onConfirm={handleConfirmLeave} />
    </div>
  );
}

export default AnnouncementManagement;
