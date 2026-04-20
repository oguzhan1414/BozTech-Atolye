
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaRegBell, FaUsers } from 'react-icons/fa';
import '../styles/UpcomingEventsDetails.css';

function UpcomingEventsDetails() {
  const { eventsId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvent = async () => {
      try {
        const response = await eventService.getById(eventsId);
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error("Etkinlik detay okuma hatası:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventsId]);

  if (loading) {
    return (
      <div className="event-detail-loading">
        <div className="loader"></div>
        <p>Etkinlik yukleniyor...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-notfound">
        <div className="notfound-card">
          <h2>Etkinlik Bulunamadi</h2>
          <p>Aradiginiz etkinlik guncel listede yer almiyor olabilir.</p>
          <button onClick={() => navigate(-1)} className="btn-primary-custom">Geri Don</button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="container-custom">
        {/* Üst Kısım: Geri Dönüş */}
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Geri Dön
        </button>

        {/* Detay Kartı */}
        <div className="event-detail-card">
          <div className="event-cover">
            <img
              src={event.image || '/placeholders/image-fallback.svg'}
              alt={event.title || 'Etkinlik gorseli'}
              onError={(imgEvent) => {
                imgEvent.currentTarget.onerror = null;
                imgEvent.currentTarget.src = '/placeholders/image-fallback.svg';
              }}
            />
          </div>

          <div className="event-detail-header">
            <div className="event-meta">
              <span className="detail-meta-type">
                <FaTag size={12} /> {event.category}
              </span>
              <span className="detail-meta-date">
                <FaCalendarAlt size={12} /> {new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="detail-meta-time">
                <FaClock size={12} /> {event.time}
              </span>
            </div>
            
            <h1 className="event-detail-title">{event.title}</h1>

            <div className="event-stats">
              <div className="stat-item">
                <FaMapMarkerAlt size={16} />
                <span>{event.location}</span>
              </div>
              <div className="stat-item">
                <FaUsers size={16} />
                <span>{event.participants || 0} Katilimci</span>
              </div>
            </div>
          </div>

          <div className="event-detail-content">
            <div className="event-description">
              <h3 className="event-description-title">Etkinlik Detayi</h3>
              {event.description}
            </div>

            {/* Geçmiş etkinlik değilse Kayıt kutusunu göster */}
            {event.type !== 'past' && new Date(event.date) >= new Date(new Date().setHours(0,0,0,0)) && (
              <div className="event-action-box">
                <p>Bu etkinliğe katılmak ve yerini ayırtmak için hemen kaydol!</p>
                <button 
                  onClick={() => setShowRegisterInfo(true)}
                  className="btn-record"
                >
                  Hemen Kaydol
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRegisterInfo && (
        <div className="register-info-overlay" onClick={() => setShowRegisterInfo(false)}>
          <div className="register-info-modal" onClick={(e) => e.stopPropagation()}>
            <span className="register-info-icon" aria-hidden="true">
              <FaRegBell />
            </span>
            <h3>Kayıtlar Çok Yakında</h3>
            <p>
              Bu etkinlik için kayıt ekranı hazırlanıyor. Duyurular sayfasını ve sosyal medya hesaplarımızı takip ederek
              açılış tarihini öğrenebilirsiniz.
            </p>
            <div className="register-info-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowRegisterInfo(false)}>
                Kapat
              </button>
              <button type="button" className="btn-record" onClick={() => navigate('/duyurular')}>
                Duyurulara Git
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingEventsDetails;