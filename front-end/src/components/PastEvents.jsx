import React from 'react';
import { FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../styles/PastEventsWidget.css';

function PastEvents({ events = [] }) {
  return (
    <div className="past-events-widget">
      <div className="widget-header">
        <h3 className="widget-title">Geçmiş Etkinlikler</h3>
        <span className="widget-note">Arsivden son kayitlar</span>
      </div>
      
      <div className="past-events-container">
        {events.length === 0 ? (
          <div className="empty-state">
            <FiCalendar size={32} />
            <p>Geçmiş etkinlik bulunmuyor.</p>
          </div>
        ) : (
          events.slice(0, 4).map((event) => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: 'short'
            });
            const eventYear = eventDate.getFullYear();
            
            return (
              <div key={event._id} className="past-event-row">
                {/* Sol Kısım: Sadece Tarih rozeti */}
                <div className="date-badge">
                  <span className="day-month">{formattedDate}</span>
                  <span className="year">{eventYear}</span>
                </div>
                
                {/* Sağ Kısım: Detaylar */}
                <div className="event-info-wrapper">
                  <h4 className="event-title">{event.title}</h4>
                  <p className="event-desc">{event.description}</p>
                  
                  <div className="event-bottom-bar">
                    <div className="event-stats-row">
                      {event.location && (
                        <span><FiMapPin size={12} /> {event.location}</span>
                      )}
                      <span><FiUsers size={12} /> {event.participants || 0} Katılımcı</span>
                    </div>
                    
                    <Link to={`/etkinlik/${event._id}`} className="read-more-btn">
                      Detaylar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PastEvents;