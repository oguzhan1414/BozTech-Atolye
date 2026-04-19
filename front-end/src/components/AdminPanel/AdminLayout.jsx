import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiBell, 
  FiMail, 
  FiCalendar, 
  FiImage, 
  FiUsers, 
  FiSettings,
  FiLogOut,
  FiInfo,
  FiFileText,
  FiSearch,
  FiChevronDown
} from 'react-icons/fi';
import '../../styles/Admin.css';

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Giriş yapmış kullanıcının bilgilerini LocalStorage'dan al
  const admin = {
    name: localStorage.getItem('userName') || 'Yönetici',
    email: 'Sistem Yöneticisi', // Dinamik olarak context/state'den de çekilebilir
    role: localStorage.getItem('userRole') === 'admin' ? 'Super Admin' : 'Editör',
    avatar: null
  };

  const storedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
  const userRole = localStorage.getItem('userRole');

  const allMenuItems = [
    { path: '/admin/panel', icon: <FiHome />, label: 'Dashboard', requiredPerm: null },
    { path: '/admin/panel/applications', icon: <FiFileText />, label: 'Tüm Başvurular', requiredPerm: 'applications' },
    { path: '/admin/panel/announcements', icon: <FiBell />, label: 'Duyurular', requiredPerm: 'announcements' },
    { path: '/admin/panel/events', icon: <FiCalendar />, label: 'Etkinlikler', requiredPerm: 'events' },
    { path: '/admin/panel/photos', icon: <FiImage />, label: 'Foto Galeri', requiredPerm: 'photos' },
    { path: '/admin/panel/club-info', icon: <FiInfo />, label: 'Kulüp Bilgi', requiredPerm: 'clubInfo' },
    { path: '/admin/panel/users', icon: <FiUsers />, label: 'Kullanıcılar', requiredPerm: 'users' },
    { path: '/admin/panel/settings', icon: <FiSettings />, label: 'Ayarlar', requiredPerm: 'adminOnly' }
  ];

  // Menüyü yetkilere göre filtrele
  const menuItems = allMenuItems.filter(item => {
    if (userRole === 'admin') return true; // Admin her şeyi görür
    if (!item.requiredPerm) return true; // Dashboard herkese açık
    if (item.requiredPerm === 'adminOnly') return false; // Ayarlar sadece admin'e
    return storedPermissions[item.requiredPerm] === true;
  });

  const handleLogout = () => {
    // Logout işlemi
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">T</div>
            {!sidebarCollapsed && <span>Tech Club Admin</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="nav-text">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {admin.avatar ? (
                <img src={admin.avatar} alt={admin.name} />
              ) : (
                admin.name.charAt(0)
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <h4>{admin.name}</h4>
                <p>{admin.role}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> {!sidebarCollapsed && 'Çıkış Yap'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <header className="admin-header">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FiMenu />
          </button>

          <div className="header-actions">
            {/* Bildirim zili (Aktif değilse gizlendi) */}
            <div className="header-profile">
              <div className="user-avatar">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={admin.name} />
                ) : (
                  admin.name.charAt(0)
                )}
              </div>
              <div className="profile-info">
                <strong>{admin.name}</strong>
                <p>{admin.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;