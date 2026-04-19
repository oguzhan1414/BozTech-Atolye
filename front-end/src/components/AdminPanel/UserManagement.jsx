import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, FiFilter, FiShield, FiUserCheck } from 'react-icons/fi';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Backend'den kullanıcıları çek
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      setError('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await userService.delete(id);
        if (response.success) {
          setUsers(users.filter(u => u._id !== id));
        }
      } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        alert('Kullanıcı silinirken bir hata oluştu');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingUser) {
        // Güncelle
        const response = await userService.update(editingUser._id, formData);
        if (response.success) {
          setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
        }
      } else {
        // Yeni kullanıcı ekle (authService.registerEditor kullan)
        const response = await authService.registerEditor(formData);
        if (response.success && response.user) {
          // Backend id veya _id döndürebilir, _id olarak eşitliyoruz
          const newUser = { ...response.user, _id: response.user._id || response.user.id };
          setUsers([newUser, ...users]);
          setShowModal(false);
          setSuccessMessage('Yeni üye başarıyla oluşturuldu!');
        }
      }
    } catch (error) {
      console.error('Kullanıcı kaydedilirken hata:', error);
      alert('Kullanıcı kaydedilirken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Filtreleme
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || u.role === filterRole;
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
        <h2>Kullanıcı Yönetimi</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Yeni Kullanıcı
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Kullanıcı ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FiFilter />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="editor">Editör</option>
            <option value="viewer">İzleyici</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>İsim</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>Yetkiler</th>
              <th>Son Giriş</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">Kullanıcı bulunamadı</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>#{user._id.slice(-4)}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' && <FiShield />}
                      {user.role === 'editor' && <FiEdit2 />}
                      {user.role === 'viewer' && <FiEye />}
                      {user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Editör' : 'İzleyici'}
                    </span>
                  </td>
                  <td>
                    <div className="permission-icons">
                      {user.permissions?.announcements && <span title="Duyurular">📢</span>}
                      {user.permissions?.events && <span title="Etkinlikler">📅</span>}
                      {user.permissions?.photos && <span title="Fotoğraflar">📷</span>}
                      {user.permissions?.clubInfo && <span title="Kulüp Bilgi">ℹ️</span>}
                      {user.permissions?.users && <span title="Kullanıcılar">👥</span>}
                    </div>
                  </td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>
                    <span className={`status-badge status-${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEdit(user)}
                        title="Düzenle"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(user._id)}
                        title="Sil"
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
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

      {showModal && (
        <UserModal 
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* BAŞARI MODALI */}
      {successMessage && (
        <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)' }}>
          <div className="modal-content" style={{ padding: '30px', textAlign: 'center', borderRadius: '12px', maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>
              <FiUserCheck style={{ display: 'inline-block' }} />
            </div>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>İşlem Başarılı</h3>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '24px' }}>{successMessage}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setSuccessMessage('')}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '15px' }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal Component
function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'editor',
    isActive: user?.isActive !== undefined ? user.isActive : true,
    permissions: user?.permissions || {
      announcements: false,
      events: false,
      photos: false,
      clubInfo: false,
      users: false,
      applications: false
    }
  });
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const {
    isWarningOpen,
    message,
    requestConfirmation,
    handleCancelLeave,
    handleConfirmLeave,
  } = useUnsavedChangesPrompt(isDirty, 'Kaydedilmemis kullanici degisiklikleri var. Ayrilirsaniz degisiklikler kaybolacak.');

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

  const handlePermissionChange = (perm) => {
    setIsDirty(true);
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [perm]: !formData.permissions[perm]
      }
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
          <h3>{user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h3>
          <button className="modal-close" onClick={handleAttemptClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>İsim Soyisim</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>E-posta</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              required
              disabled={saving}
            />
          </div>

          {!user && (
            <div className="form-group">
              <label>Şifre</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                required={!user}
                minLength={6}
                disabled={saving}
                placeholder="En az 6 karakter"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Rol</label>
              <select 
                value={formData.role}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                disabled={saving}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editör</option>
                <option value="viewer">İzleyici</option>
              </select>
            </div>

            <div className="form-group">
              <label>Durum</label>
              <select 
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleFieldChange('isActive', e.target.value === 'active')}
                disabled={saving}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Yetkiler</label>
            <div className="permissions-grid">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.permissions.announcements}
                  onChange={() => handlePermissionChange('announcements')}
                  disabled={saving || formData.role === 'admin'}
                />
                Duyurular
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.permissions.events}
                  onChange={() => handlePermissionChange('events')}
                  disabled={saving || formData.role === 'admin'}
                />
                Etkinlikler
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.permissions.photos}
                  onChange={() => handlePermissionChange('photos')}
                  disabled={saving || formData.role === 'admin'}
                />
                Fotoğraflar
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.permissions.clubInfo}
                  onChange={() => handlePermissionChange('clubInfo')}
                  disabled={saving || formData.role === 'admin'}
                />
                Kulüp Bilgi
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.permissions.users}
                  onChange={() => handlePermissionChange('users')}
                  disabled={saving || formData.role === 'admin'}
                />
                Kullanıcılar
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.permissions.applications}
                  onChange={() => handlePermissionChange('applications')}
                  disabled={saving || formData.role === 'admin'}
                />
                Başvurular
              </label>
            </div>
            {formData.role === 'admin' && (
              <small className="text-muted">Admin kullanıcıları tüm yetkilere sahiptir.</small>
            )}
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

export default UserManagement;