import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { announcementService } from '../services/announcementService';
import { FiCalendar, FiArrowLeft, FiTag, FiUser, FiClock } from 'react-icons/fi';
import '../styles/DuyuruDetail.css';

function DuyuruDetail() {
  const { duyuruId } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await announcementService.getById(duyuruId);
        if (res.success) {
          setAnnouncement(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [duyuruId]);

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'teknik':
        return { bg: 'rgba(59, 130, 246, 0.08)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' };
      case 'genel':
        return { bg: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.08)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  if (loading) {
    return (
      <div className="duyuru-detail-loading">
        <div className="loader"></div>
        <p>Duyuru yükleniyor...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="duyuru-detail-notfound">
        <div className="notfound-card">
          <h2>Duyuru Bulunamadı</h2>
          <p>Aradığınız duyuru mevcut değil veya kaldırılmış olabilir.</p>
          <Link to="/" className="btn-primary-custom">
            <FiArrowLeft /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const typeColors = getTypeColor(announcement.type);
  const formattedDate = new Date(announcement.date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = new Date(announcement.date).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="duyuru-detail-page">
      <div className="container-custom">
        {/* Geri Dön Butonu */}
        <Link to="/" className="back-button">
          <FiArrowLeft /> Geri Dön
        </Link>

        {/* Ana İçerik */}
        <div className="announcement-detail-card">
          {/* Header */}
          <div className="announcement-detail-header">
            <div className="announcement-meta">
              <div className="announcement-type" style={{
                background: typeColors.bg,
                color: typeColors.color,
                border: `1px solid ${typeColors.border}`
              }}>
                <FiTag size={14} />
                <span>{announcement.type || 'Genel'}</span>
              </div>
              <div className="announcement-date">
                <FiCalendar size={14} />
                <span>{formattedDate}</span>
              </div>
              <div className="announcement-time">
                <FiClock size={14} />
                <span>{formattedTime}</span>
              </div>
            </div>

            <h1 className="announcement-detail-title">{announcement.title}</h1>

            {/* İstatistikler */}
            <div className="announcement-stats">

              <div className="stat-item">
                <FiUser size={16} />
                <span>{announcement.author || 'BozTech Admin'}</span>
              </div>
            </div>
          </div>

          {/* İçerik */}
          <div className="announcement-detail-content">
            {announcement.image && (
              <div className="announcement-image">
                <img src={announcement.image} alt={announcement.title} />
              </div>
            )}
            <div className="announcement-description">
              {announcement.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DuyuruDetail;