import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import { clubInfoService } from '../services/clubInfoService';
import '../styles/footer.css';

const toExternalUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    linkedin: '',
    youtube: '',
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await clubInfoService.getBySection('socialLinks');
        if (response?.success && response.data) {
          setSocialLinks({
            instagram: response.data.instagram || '',
            linkedin: response.data.linkedin || '',
            youtube: response.data.youtube || '',
          });
        }
      } catch (error) {
        console.error('Sosyal medya linkleri getirilemedi:', error);
      }
    };

    fetchSocialLinks();
  }, []);

  const visibleSocialLinks = useMemo(() => {
    return [
      { key: 'instagram', href: toExternalUrl(socialLinks.instagram), icon: <FiInstagram />, label: 'Instagram' },
      { key: 'linkedin', href: toExternalUrl(socialLinks.linkedin), icon: <FiLinkedin />, label: 'LinkedIn' },
      { key: 'youtube', href: toExternalUrl(socialLinks.youtube), icon: <FiYoutube />, label: 'YouTube' },
    ].filter((item) => item.href);
  }, [socialLinks]);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Marka Bölümü */}
          <div className="footer-brand">
            <div className="footer-logo">
              <h2 className="logo-text">BozTech</h2>
            </div>
            <p className="footer-description">
              Yozgat Bozok Üniversitesi'nin teknoloji odaklı topluluğu olarak,
              teoriyi pratiğe dönüştürüyor ve geleceğin mühendislerini yetiştiriyoruz.
            </p>
            <div className="social-links">
              {visibleSocialLinks.map((item) => (
                <a key={item.key} href={item.href} target="_blank" rel="noreferrer" className="social-link" aria-label={item.label}>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigasyon Bölümü */}
          <div className="footer-links">
            <h3 className="footer-heading">Hızlı Bağlantılar</h3>
            <ul className="footer-nav">
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/club-info">Kulüp Bilgisi</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
              <li><Link to="/apply">Üyelik Başvurusu</Link></li>
            </ul>
          </div>

          {/* İletişim Bölümü */}
          <div className="footer-contact">
            <h3 className="footer-heading">Bize Ulaşın</h3>
            <div className="contact-info">
              <div className="contact-item">
                <FiMapPin className="contact-icon" />
                <span>Yozgat Bozok Üniversitesi Kampüsü, Bilgisayar Mühendisliği Atölyesi</span>
              </div>
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>boztechrd@gmail.com</span>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <span>+90 553 159 47 47</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;