// src/components/Sidebar.jsx
import React from 'react';
import { FaBullseye, FaUsers } from 'react-icons/fa';
import { MdSettingsSuggest } from 'react-icons/md';
import '../styles/ClubInfo.css'
function Sidebar({ activeSection, setActiveSection }) {
  const menuItems = [
    { id: 'mission', label: 'Misyon & Vizyon', icon: <FaBullseye /> },
    { id: 'services', label: 'Hizmetler', icon: <MdSettingsSuggest /> },
    { id: 'board', label: 'Yönetim Kurulu', icon: <FaUsers /> },
  ];

  return (
    <div className="sidebar-card">
      <h4 className="sidebar-title">Menü</h4>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`sidebar-btn ${activeSection === item.id ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;