import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../styles/UpcomingEventsWidget.css';

function UpcomingEvents({ events = [] }) {
  return (
    <div className="section ue-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <FiCalendar size={24} />
            <h2>Gelecek Etkinlikler</h2>
          </div>
          <div className="section-header-actions">
            <span className="section-meta-pill">
              Yaklasan {events.length} etkinlik
            </span>
            <Link to="/etkinlikler" className="section-view-link">
              Tümünü Görüntüle
            </Link>
          </div>
        </div>

        <div className="ue-grid">
          {events.length === 0 ? (
            <p className="ue-empty">Yaklasan etkinlik bulunmuyor.</p>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.date);
              const day = eventDate.getDate();
              const month = eventDate.toLocaleString('tr-TR', { month: 'short' });
              
              return (
                <div key={event._id} className="ue-card">
                  <div className="ue-date-box">
                    <div className="ue-day">{day}</div>
                    <div className="ue-month">{month}</div>
                  </div>
                  
                  <div className="ue-content">
                    <div className="ue-thumb">
                      <img
                        src={event.image || '/placeholders/image-fallback.svg'}
                        alt={event.title || 'Etkinlik gorseli'}
                        onError={(imgEvent) => {
                          imgEvent.currentTarget.onerror = null;
                          imgEvent.currentTarget.src = '/placeholders/image-fallback.svg';
                        }}
                      />
                    </div>

                    <div className="ue-header">
                      <h3 className="ue-title">{event.title}</h3>
                      <span className="ue-category">{event.category}</span>
                    </div>
                    
                    <p className="ue-desc">{event.description}</p>
                    
                    <div className="ue-details">
                      <div className="ue-detail-item">
                        <FiClock size={14} />
                        <span>{event.time}</span>
                      </div>
                      <div className="ue-detail-item">
                        <FiMapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                      <div className="ue-detail-item">
                        <FiUsers size={14} />
                        <span>{event.participants || 0} Katilimci</span>
                      </div>
                    </div>
                    
                    <div className="ue-actions">
                      <Link to={`/etkinlik/${event._id}`} className="ue-link">
                        Detayları İncele
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingEvents;