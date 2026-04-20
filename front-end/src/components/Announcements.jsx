import React from 'react';
import { FiCalendar, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Announcements({ announcements = [] }) {
  const previewAnnouncements = announcements.slice(0, 3);

  return (
    <div id="duyurular" className="section announcements-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <FiBell size={24} />
            <h2>Duyurular</h2>
          </div>
          <div className="section-header-actions">
            <span className="section-meta-pill">
              Son {announcements.length} duyuru
            </span>
            <Link to="/duyurular" className="section-view-link">
              Tümünü Görüntüle
            </Link>
          </div>
        </div>

        <div className="announcements-grid">
          {previewAnnouncements.length === 0 ? (
            <p className="announcement-empty">Henuz yayinlanmis duyuru bulunmuyor.</p>
          ) : (
            previewAnnouncements.map((announcement) => (
              <div 
                key={announcement._id} 
                className={`announcement-card type-${announcement.type?.toLowerCase() || 'genel'}`}
              >
                <div className="announcement-header">
                  <span className="announcement-badge">
                    {announcement.type || 'Genel'}
                  </span>
                  <div className="announcement-date">
                    <FiCalendar size={16} />
                    {new Date(announcement.date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                
                <h3 className="announcement-title">{announcement.title}</h3>
                <p className="announcement-description">{announcement.description}</p>
                
                <div className="announcement-footer">
                  <Link to={`/duyuru/${announcement._id}`} className="btn btn-primary btn-sm">
                    Detayları Gör
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;