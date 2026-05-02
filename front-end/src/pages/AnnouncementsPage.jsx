import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCalendar } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { announcementService } from '../services/announcementService';
import '../styles/ArchivePages.css';

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementService.getAll();
        if (response?.success) {
          setAnnouncements(response.data || []);
        }
      } catch (error) {
        console.error('Duyurular yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [announcements]);

  if (loading) {
    return <div className="archive-page container">Yukleniyor...</div>;
  }

  return (
    <>
    <Helmet>
      <title>Duyurular | BozTech</title>
      <meta name="description" content="BozTech topluluğunun tüm duyurularına ulaşın. BozTech R&D etkinlikleri, haberler ve güncellemeler." />
      <link rel="canonical" href="https://boztech.com.tr/duyurular" />
    </Helmet>
    <section className="archive-page section">
      <div className="container">
        <header className="archive-header">
          <h1><FiBell /> <span className="highlight">Tüm Duyurular</span></h1>
        </header>

        <div className="archive-grid">
          {sortedAnnouncements.length === 0 ? (
            <p className="archive-empty">Henuz duyuru bulunmuyor.</p>
          ) : (
            sortedAnnouncements.map((item) => (
              <article key={item._id} className="archive-card">
                <div className="archive-card-head">
                  <span className={`archive-pill archive-${String(item.type || 'genel').toLowerCase()}`}>
                    {item.type || 'Genel'}
                  </span>
                  <span className="archive-date">
                    <FiCalendar size={14} />
                    {new Date(item.date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={`/duyuru/${item._id}`} className="archive-link">Detayı Aç</Link>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
    </>
  );
}

export default AnnouncementsPage;
