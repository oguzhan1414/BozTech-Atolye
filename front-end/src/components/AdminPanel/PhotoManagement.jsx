import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiUpload } from 'react-icons/fi';
import { photoService } from '../../services/photoService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

function PhotoManagement() {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getAllAdmin();
      if (response.success) setPhotos(response.data || []);
    } catch (error) {
      console.error('Fotoğraflar yüklenirken hata:', error);
      setError('Fotoğraflar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => { setEditingPhoto(null); setShowModal(true); };
  const handleEdit = (photo) => { setEditingPhoto(photo); setShowModal(true); };
  const handleDeleteRequest = (photo) => setDeleteTarget(photo);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await photoService.delete(deleteTarget._id);
      if (response.success) {
        setPhotos(prev => prev.filter(p => p._id !== deleteTarget._id));
        showToast('Fotoğraf kalıcı olarak silindi.');
      }
      setDeleteTarget(null);
    } catch (apiError) {
      console.error('Fotoğraf silinirken hata:', apiError);
      showToast('Fotoğraf silinirken bir hata oluştu.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (payload, hasNewFile) => {
    try {
      if (editingPhoto) {
        let response;
        if (hasNewFile) {
          response = await photoService.updateWithFile(editingPhoto._id, payload);
        } else {
          response = await photoService.update(editingPhoto._id, payload);
        }
        if (response.success) {
          setPhotos(photos.map(p => p._id === editingPhoto._id ? response.data : p));
          showToast('Fotoğraf güncellendi.');
        }
      } else {
        const response = await photoService.upload(payload);
        if (response.success) {
          setPhotos([response.data, ...photos]);
          showToast('Fotoğraf yüklendi.');
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Fotoğraf kaydedilirken hata:', error);
      showToast('Fotoğraf kaydedilirken bir hata oluştu.', 'error');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('tr-TR');

  const filteredPhotos = photos.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags?.some(tag => tag.includes(searchTerm.toLowerCase()));
    const matchesFilter = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Fotoğraf Galerisi Yönetimi</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Yeni Fotoğraf
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input type="text" placeholder="Fotoğraf ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-box">
          <FiFilter />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Tüm Kategoriler</option>
            <option value="Teknik">Teknik</option>
            <option value="Eğitim">Eğitim</option>
            <option value="Sosyal">Sosyal</option>
            <option value="Kamp">Kamp</option>
            <option value="Proje">Proje</option>
          </select>
        </div>
      </div>

      <div className="photo-grid-admin">
        {filteredPhotos.length === 0 ? (
          <p className="text-center">Fotoğraf bulunamadı</p>
        ) : (
          filteredPhotos.map(photo => (
            <div key={photo._id} className="photo-card">
              <div className="photo-preview">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  onError={e => { e.target.onerror = null; e.target.src = '/placeholders/image-fallback.svg'; }}
                />
                <div className="photo-actions">
                  <button className="btn-icon" onClick={() => handleEdit(photo)} title="Düzenle"><FiEdit2 /></button>
                  <button className="btn-icon" onClick={() => handleDeleteRequest(photo)} title="Sil"><FiTrash2 /></button>
                </div>
              </div>
              <div className="photo-info">
                <h4>{photo.title}</h4>
                <p>{photo.category}</p>
                <div className="photo-tags">
                  {photo.tags?.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}
                </div>
                <div className="photo-meta">
                  <span>{photo.uploadedBy?.name || 'Admin'}</span>
                  <span>{formatDate(photo.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <PhotoModal photo={editingPhoto} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Fotoğrafı Kalıcı Sil"
        message="Bu fotoğraf silindiğinde hem veritabanından hem de sunucudaki dosyalardan kaldırılır."
        itemName={deleteTarget?.title}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

function PhotoModal({ photo, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: photo?.title || '',
    category: photo?.category || 'Teknik',
    tags: photo?.tags?.join(', ') || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(photo?.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { isWarningOpen, message, requestConfirmation, handleCancelLeave, handleConfirmLeave } =
    useUnsavedChangesPrompt(isDirty, 'Kaydedilmemiş fotoğraf değişiklikleri var. Ayrılırsanız değişiklikler kaybolacak.');

  const handleFieldChange = (field, value) => { setIsDirty(true); setFormData(prev => ({ ...prev, [field]: value })); };
  const handleAttemptClose = () => requestConfirmation(() => { setIsDirty(false); onClose(); });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsDirty(true);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (photo && !selectedFile) {
      // Edit - sadece metadata
      await onSave({ title: formData.title, category: formData.category, tags: tagsArray }, false);
    } else {
      // Yeni fotoğraf veya resim değişikliği → FormData
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('category', formData.category);
      fd.append('tags', tagsArray.join(','));
      if (selectedFile) fd.append('photo', selectedFile);
      await onSave(fd, true);
    }
    setIsDirty(false);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={handleAttemptClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{photo ? 'Fotoğraf Düzenle' : 'Yeni Fotoğraf'}</h3>
          <button className="modal-close" onClick={handleAttemptClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Başlık</label>
            <input type="text" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} required disabled={saving} />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select value={formData.category} onChange={e => handleFieldChange('category', e.target.value)} disabled={saving}>
              <option value="Teknik">Teknik</option>
              <option value="Eğitim">Eğitim</option>
              <option value="Sosyal">Sosyal</option>
              <option value="Kamp">Kamp</option>
              <option value="Proje">Proje</option>
            </select>
          </div>

          {/* Fotoğraf alanı - hem yeni eklemede hem düzenlemede görünür */}
          <div className="form-group">
            <label>{photo ? 'Fotoğrafı Değiştir (opsiyonel)' : 'Fotoğraf Yükle'}</label>
            <div className="upload-area">
              {previewUrl ? (
                <div className="preview-container">
                  <img src={previewUrl} alt="Önizleme" className="preview-image" />
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={() => { setIsDirty(true); setSelectedFile(null); setPreviewUrl(photo?.imageUrl || null); }}
                  >
                    {selectedFile ? 'Seçimi İptal Et' : 'Değiştir'}
                  </button>
                  {selectedFile && (
                    <label style={{ display: 'block', marginTop: '8px', cursor: 'pointer', color: '#3b82f6', fontSize: '13px' }}>
                      Başka fotoğraf seç
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={saving} />
                    </label>
                  )}
                </div>
              ) : (
                <>
                  <FiUpload size={24} />
                  <p>Fotoğraf seçmek için tıklayın veya sürükleyin</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} required={!photo} disabled={saving} />
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Etiketler (virgülle ayırın)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => handleFieldChange('tags', e.target.value)}
              placeholder="hackathon, kodlama, yarışma"
              disabled={saving}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleAttemptClose} disabled={saving}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={saving || (!photo && !selectedFile)}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <UnsavedChangesModal isOpen={isWarningOpen} message={message} onCancel={handleCancelLeave} onConfirm={handleConfirmLeave} />
    </div>
  );
}

export default PhotoManagement;
