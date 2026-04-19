import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import Announcements from '../components/Announcements';
import UpcomingEvents from '../components/UpcomingEvents';
import PastEvents from '../components/PastEvents';
import PhotoGallery from '../components/PhotoGallery';
import { announcementService } from '../services/announcementService';
import { eventService } from '../services/eventService';
import { photoService } from '../services/photoService';

function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Tüm verileri paralel olarak çek
      const [announcementsRes, upcomingRes, pastRes, photosRes] = await Promise.all([
        announcementService.getAll(),
        eventService.getAll({ type: 'upcoming' }),
        eventService.getAll({ type: 'past' }),
        photoService.getAll({ limit: 8 })
      ]);

      setAnnouncements(announcementsRes.data || []);
      setUpcomingEvents(upcomingRes.data || []);
      setPastEvents(pastRes.data || []);
      setPhotos(photosRes.data || []);
      
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Baloncuklar HeroSection'ın arka planında süzülecek */}
      <div className="hero-wrapper" style={{ position: 'relative' }}>
        <div className="bubbles-container">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>
        <HeroSection />
      </div>

      {/* Verileri prop olarak component'lere gönder */}
      <Announcements announcements={announcements} />
      <UpcomingEvents events={upcomingEvents} />
      
      <div className="section home-stage-section">
        <div className="container">
          <PastEvents events={pastEvents} />
        </div>
      </div>
      
      <div className="section home-gallery-section">
        <div className="container">
          <PhotoGallery photos={photos} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;