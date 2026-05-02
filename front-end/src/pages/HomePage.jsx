import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/HeroSection';
import Announcements from '../components/Announcements';
import UpcomingEvents from '../components/UpcomingEvents';
import PastEvents from '../components/PastEvents';
import PhotoGallery from '../components/PhotoGallery';
import HomeProjects from '../components/HomeProjects';
import { announcementService } from '../services/announcementService';
import { eventService } from '../services/eventService';
import { photoService } from '../services/photoService';
import { projectService } from '../services/projectService';

function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Tüm verileri paralel olarak çek
      const [announcementsRes, upcomingRes, pastRes, photosRes, projectsRes] = await Promise.all([
        announcementService.getAll(),
        eventService.getAll({ type: 'upcoming' }),
        eventService.getAll({ type: 'past' }),
        photoService.getAll({ limit: 8 }),
        projectService.getAll()
      ]);

      setAnnouncements(announcementsRes.data || []);
      setUpcomingEvents(upcomingRes.data || []);
      setPastEvents(pastRes.data || []);
      setPhotos(photosRes.data || []);
      setProjects(projectsRes.data || []);
      
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
    <>
    <Helmet>
      <title>BozTech | Yozgat Bozok Üniversitesi Teknoloji Topluluğu</title>
      <meta name="description" content="BozTech (BozTech R&D), Yozgat Bozok Üniversitesi'nin teknoloji ve Ar-Ge topluluğudur. Yapay zeka, mobil uygulama, robotik ve siber güvenlik alanlarında projeler geliştiriyoruz." />
      <link rel="canonical" href="https://boztech.com.tr/" />
    </Helmet>
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
      <HomeProjects projects={projects} />
      
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
    </>
  );
}

export default HomePage;