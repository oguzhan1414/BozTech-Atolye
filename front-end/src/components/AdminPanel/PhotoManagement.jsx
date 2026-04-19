import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, FiFilter, FiImage, FiUpload } from 'react-icons/fi';
import { photoService } from '../../services/photoService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

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
  const [feedback, setFeedback] = useState(null);

  // Backend'den fotoğrafları çek
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getAllAdmin();
      if (response.success) {
        setPhotos(response.data || []);
      }
    } catch (error) {
      console.error('Fotoğraflar yüklenirken hata:', error);
      setError('Fotoğraflar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPhoto(null);
    setShowModal(true);
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setShowModal(true);
  };

  const getErrorMessage = (apiError, fallbackMessage) => {
    if (apiError && typeof apiError.message === 'string') {
      return apiError.message;
    }
    return fallbackMessage;
  };

  const handleDeleteRequest = (photo) => {
    setDeleteTarget(photo);
    setFeedback(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const response = await photoService.delete(deleteTarget._id);
      if (response.success) {
        setPhotos((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        setFeedback({
          type: 'success',
          message: 'Fotograf kalici olarak silindi.'
        });
      }
      setDeleteTarget(null);
    } catch (apiError) {
      console.error('Fotograf silinirken hata:', apiError);
      setFeedback({
        type: 'error',
        message: getErrorMessage(apiError, 'Fotograf silinirken bir hata olustu')
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingPhoto) {
        // Güncelle
        const response = await photoService.update(editingPhoto._id, formData);
        if (response.success) {
          setPhotos(photos.map(p => p._id === editingPhoto._id ? response.data : p));
        }
      } else {
        // Yeni ekle - formData FormData objesi
        const response = await photoService.upload(formData);
        if (response.success) {
          setPhotos([response.data, ...photos]);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Fotoğraf kaydedilirken hata:', error);
      alert('Fotoğraf kaydedilirken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Filtreleme
  const filteredPhotos = photos.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.tags?.some(tag => tag.includes(searchTerm.toLowerCase()));
    const matchesFilter = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Fotoğraf Galerisi Yönetimi</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Yeni Fotoğraf
        </button>
      </div>

      {feedback ? (
        <div className={`admin-feedback ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Bildirimi kapat">
            ×
          </button>
        </div>
      ) : null}

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Fotoğraf ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FiFilter />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
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
          filteredPhotos.map((photo) => (
            <div key={photo._id} className="photo-card">
              <div className="photo-preview">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Resim+Yok';
                  }}
                />
                <div className="photo-actions">
                  <button className="btn-icon" onClick={() => handleEdit(photo)} title="Düzenle">
                    <FiEdit2 />
                  </button>
                  <button className="btn-icon" onClick={() => handleDeleteRequest(photo)} title="Sil">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="photo-info">
                <h4>{photo.title}</h4>
                <p>{photo.category}</p>
                <div className="photo-tags">
                  {photo.tags?.map((tag, i) => (
                    <span key={i} className="tag">#{tag}</span>
                  ))}
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
        <PhotoModal 
          photo={editingPhoto}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Fotografi Kalici Sil"
        message="Bu fotograf silindiginde hem veritabanindan hem de sunucudaki dosyalardan kaldirilir."
        itemName={deleteTarget?.title}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// Modal Component
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
  const {
    isWarningOpen,
    message,
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isDirty, 'Kaydedilmemis fotograf degisiklikleri var. Ayrilirsaniz degisiklikler kaybolacak.');

  const handleFieldChange = (field, value) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttemptClose = () => {
    requestConfirmation(() => {
      setIsDirty(false);
      onClose();
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsDirty(true);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (photo) {
      // Düzenleme - sadece metin verileri
      await onSave({
        title: formData.title,
        category: formData.category,
        tags: tagsArray
      });
    } else {
      // Yeni fotoğraf - FormData ile
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('category', formData.category);
      formDataObj.append('tags', tagsArray.join(','));
      if (selectedFile) {
        formDataObj.append('photo', selectedFile);
      }
      await onSave(formDataObj);
    }

    setIsDirty(false);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={handleAttemptClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{photo ? 'Fotoğraf Düzenle' : 'Yeni Fotoğraf'}</h3>
          <button className="modal-close" onClick={handleAttemptClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Başlık</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select 
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              disabled={saving}
            >
              <option value="Teknik">Teknik</option>
              <option value="Eğitim">Eğitim</option>
              <option value="Sosyal">Sosyal</option>
              <option value="Kamp">Kamp</option>
              <option value="Proje">Proje</option>
            </select>
          </div>

          {!photo && (
            <div className="form-group">
              <label>Fotoğraf Yükle</label>
              <div className="upload-area">
                {previewUrl ? (
                  <div className="preview-container">
                    <img src={previewUrl} alt="Önizleme" className="preview-image" />
                    <button 
                      type="button"
                      className="change-photo-btn"
                      onClick={() => {
                        setIsDirty(true);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload size={24} />
                    <p>Fotoğraf seçmek için tıklayın veya sürükleyin</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      required={!photo}
                      disabled={saving}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Etiketler (virgülle ayırın)</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={(e) => handleFieldChange('tags', e.target.value)}
              placeholder="hackathon, kodlama, yarışma"
              disabled={saving}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleAttemptClose}
              disabled={saving}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving || (!photo && !selectedFile)}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
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

export default PhotoManagement;