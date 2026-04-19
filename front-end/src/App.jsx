import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Sayfa Importları
import HomePage from './pages/HomePage';
import ClubInfoPage from './pages/ClubInfoPage';
import ContactPage from './pages/ContactPage';
import ApplicationPage from './pages/Basvuru';
import ProjectDetail from './pages/ProjectDetail';
import UpcomingEventsDetails from './pages/UpcomingEventsDetails';
import DuyuruDetail from './pages/DuyuruDetail';

// Admin Importları
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

// Bileşen Importları
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      
      <Routes>
        {/* ==========================================================
            1. KULLANICI TARAFI (Header ve Footer Sadece Burada Var)
           ========================================================== */}
        <Route element={
          <>
            <Header />
            <main>
              <Outlet /> {/* Kullanıcı sayfaları buraya dolacak */}
            </main>
            <Footer />
          </>
        }>
          <Route path="/" element={<HomePage />} />
          <Route path="/club-info" element={<ClubInfoPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/projeler/:projectId" element={<ProjectDetail />} />
          <Route path="/etkinlik/:eventsId" element={<UpcomingEventsDetails />} />
          <Route path="/duyuru/:duyuruId" element={<DuyuruDetail />} />
        </Route>

        {/* ==========================================================
            2. ADMIN GİRİŞ SAYFASI (Header/Footer Yok)
           ========================================================== */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* ==========================================================
            3. ADMIN PANELİ (Kendi İç Layout'u Olan Yapı - Header/Footer Yok)
           ========================================================== */}
        <Route path="/admin/panel/*" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;