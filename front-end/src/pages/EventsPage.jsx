import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { eventService } from '../services/eventService';
import '../styles/ArchivePages.css';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        if (response?.success) {
          setEvents(response.data || []);
        }
      } catch (error) {
        console.error('Etkinlikler yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const visibleEvents = useMemo(() => {
    const now = new Date();
    const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filter === 'upcoming') {
      return sorted.filter((event) => new Date(event.date) >= now);
    }

    if (filter === 'past') {
      return sorted.filter((event) => new Date(event.date) < now);
    }

    return sorted;
  }, [events, filter]);

  if (loading) {
    return <div className="archive-page container">Yukleniyor...</div>;
  }

  return (
    <>
    <Helmet>
      <title>Etkinlikler | BozTech</title>
      <meta name="description" content="BozTech topluluğunun tüm etkinlikleri. BozTech R&D workshop, seminer ve toplantı duyuruları." />
      <link rel="canonical" href="https://boztech.com.tr/etkinlikler" />
    </Helmet>
    <section className="archive-page section">
      <div className="container">
        <header className="archive-header">
          <h1><FiCalendar /> <span className="highlight">Tüm Etkinlikler</span></h1>
        </header>

        <div className="archive-filters">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tumu</button>
          <button type="button" className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')}>Gelecek</button>
          <button type="button" className={filter === 'past' ? 'active' : ''} onClick={() => setFilter('past')}>Gecmis</button>
        </div>

        <div className="archive-grid">
          {visibleEvents.length === 0 ? (
            <p className="archive-empty">Secili filtre icin etkinlik bulunmadi.</p>
          ) : (
            visibleEvents.map((event) => {
              const isPast = new Date(event.date) < new Date();

              return (
                <article key={event._id} className="archive-card">
                  <div className="archive-event-image-wrap">
                    <img
                      src={event.image || '/placeholders/image-fallback.svg'}
                      alt={event.title || 'Etkinlik gorseli'}
                      className="archive-event-image"
                      onError={(imgEvent) => {
                        imgEvent.currentTarget.onerror = null;
                        imgEvent.currentTarget.src = '/placeholders/image-fallback.svg';
                      }}
                    />
                  </div>

                  <div className="archive-card-head">
                    <span className={`archive-pill ${isPast ? 'archive-past' : 'archive-upcoming'}`}>
                      {isPast ? 'Gecmis' : 'Yaklasan'}
                    </span>
                    <span className="archive-date">
                      <FiCalendar size={14} />
                      {new Date(event.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="archive-meta-row">
                    <span><FiClock size={13} /> {event.time || '-'}</span>
                    <span><FiMapPin size={13} /> {event.location || '-'}</span>
                    <span><FiUsers size={13} /> {event.participants || 0} Katilimci</span>
                  </div>
                  <Link to={`/etkinlik/${event._id}`} className="archive-link">Detayı Aç</Link>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
    </>
  );
}

export default EventsPage;
