import React, { useState, useEffect } from 'react';
import { FiImage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/PhotoGallerySlider.css';

function PhotoGallery({ photos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Otomatik geçiş (autoplay)
  useEffect(() => {
    if (photos.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [photos]);

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // başa dön
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(photos.length - 1); // sona dön
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="photo-gallery-slider">
        <div className="gallery-header">
          <h3>Fotoğraf Galerisi</h3>
        </div>
        <div className="slider-empty">
          <FiImage size={40} />
          <p>Henüz fotoğraf yüklenmemiş.</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="photo-gallery-slider">
      <div className="gallery-header">
        <h3>Fotoğraf Galerisi</h3>
        <span className="gallery-counter">{currentIndex + 1} / {photos.length}</span>
      </div>

      <div className="slider-main">
        {photos.length > 1 && (
          <button className="slider-nav-btn prev" onClick={handlePrev} aria-label="Önceki">
            <FiChevronLeft size={24} />
          </button>
        )}

        <img
          key={currentPhoto._id}
          src={currentPhoto.imageUrl}
          alt={currentPhoto.title || 'Galeri gorseli'}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/1200x800?text=Gorsel+Yuklenemedi';
          }}
        />

        <div className="slider-main-overlay">
          <h4>{currentPhoto.title || 'Isimsiz fotograf'}</h4>
          {currentPhoto.category && <p>{currentPhoto.category}</p>}
        </div>

        {photos.length > 1 && (
          <button className="slider-nav-btn next" onClick={handleNext} aria-label="Sonraki">
            <FiChevronRight size={24} />
          </button>
        )}
      </div>

      <div className="slider-dots">
        {photos.map((photo, index) => (
          <button
            key={photo._id}
            className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Fotoğraf ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default PhotoGallery;