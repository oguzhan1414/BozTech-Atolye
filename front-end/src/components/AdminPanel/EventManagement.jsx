import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import { eventService } from '../../services/eventService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

function EventManagement() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Backend'den etkinlikleri çek
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllAdmin();
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
      setError('Etkinlikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const getErrorMessage = (apiError, fallbackMessage) => {
    if (apiError && typeof apiError.message === 'string') {
      return apiError.message;
    }
    return fallbackMessage;
  };

  const handleDeleteRequest = (event) => {
    setDeleteTarget(event);
    setFeedback(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const response = await eventService.delete(deleteTarget._id);
      if (response.success) {
        setEvents((prev) => prev.filter((e) => e._id !== deleteTarget._id));
        setFeedback({
          type: 'success',
          message: 'Etkinlik kalici olarak silindi.'
        });
      }
      setDeleteTarget(null);
    } catch (apiError) {
      console.error('Etkinlik silinirken hata:', apiError);
      setFeedback({
        type: 'error',
        message: getErrorMessage(apiError, 'Etkinlik silinirken bir hata olustu')
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingEvent) {
        // Güncelle
        const response = await eventService.update(editingEvent._id, formData);
        if (response.success) {
          setEvents(events.map(e => e._id === editingEvent._id ? response.data : e));
        }
      } else {
        // Yeni ekle
        const response = await eventService.create(formData);
        if (response.success) {
          setEvents([response.data, ...events]);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Etkinlik kaydedilirken hata:', error);
      alert('Etkinlik kaydedilirken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Filtreleme
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || e.status === filterType;
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
        <h2>Etkinlik Yönetimi</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Yeni Etkinlik
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

      {/* Filtreler */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Etkinlik ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FiFilter />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tüm Etkinlikler</option>
            <option value="upcoming">Yaklaşan</option>
            <option value="past">Geçmiş</option>
          </select>
        </div>
      </div>

      {/* Tablo */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Konum</th>
              <th>Katılımcı</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">Etkinlik bulunamadı</td>
              </tr>
            ) : (
              filteredEvents.map((item) => (
                <tr key={item._id}>
                  <td>#{item._id.slice(-4)}</td>
                  <td>{item.title}</td>
                  <td>
                    <span className="badge badge-info">{item.category}</span>
                  </td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.time || '-'}</td>
                  <td>{item.location || '-'}</td>
                  <td>{item.participants || 0}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status === 'upcoming' ? 'Yaklaşan' : 'Geçmiş'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" title="Görüntüle">
                        <FiEye />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEdit(item)}
                        title="Düzenle"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteRequest(item)}
                        title="Sil"
                      >
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

      {/* Modal */}
      {showModal && (
        <EventModal 
          event={editingEvent}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Etkinligi Kalici Sil"
        message="Bu etkinlik silindiginde veritabanindan tamamen kaldirilir. Islem geri alinamaz."
        itemName={deleteTarget?.title}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// Modal Component
function EventModal({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    category: event?.category || 'Konferans',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    time: event?.time || '',
    location: event?.location || '',
    description: event?.description || ''
  });
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const {
    isWarningOpen,
    message,
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isDirty, 'Kaydedilmemis etkinlik degisiklikleri var. Ayrilirsaniz degisiklikler kaybolacak.');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setIsDirty(false);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={handleAttemptClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}</h3>
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

          <div className="form-row">
            <div className="form-group">
              <label>Kategori</label>
              <select 
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                disabled={saving}
              >
                <option value="Konferans">Konferans</option>
                <option value="Workshop">Workshop</option>
                <option value="Meetup">Meetup</option>
                <option value="Seminer">Seminer</option>
                <option value="Sosyal">Sosyal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Konum</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tarih</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Saat</label>
              <input 
                type="time" 
                value={formData.time}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea 
              rows="4"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              required
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
              disabled={saving}
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

export default EventManagement;