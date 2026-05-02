import React, { useEffect, useMemo, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { photoService } from '../services/photoService';
import '../styles/ArchivePages.css';

function PhotoGalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await photoService.getAll();
        if (response?.success) {
          setPhotos(response.data || []);
        }
      } catch (error) {
        console.error('Galeri yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [photos]);

  const selectedPhoto = selectedPhotoIndex >= 0 ? sortedPhotos[selectedPhotoIndex] : null;

  const handleCloseLightbox = () => setSelectedPhotoIndex(-1);
  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => {
      if (sortedPhotos.length === 0) return -1;
      return prev <= 0 ? sortedPhotos.length - 1 : prev - 1;
    });
  };
  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => {
      if (sortedPhotos.length === 0) return -1;
      return prev >= sortedPhotos.length - 1 ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    if (!selectedPhoto) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleCloseLightbox();
      if (event.key === 'ArrowLeft') handlePrevPhoto();
      if (event.key === 'ArrowRight') handleNextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  if (loading) {
    return <div className="archive-page container">Yukleniyor...</div>;
  }

  return (
    <>
    <Helmet>
      <title>Galeri | BozTech</title>
      <meta name="description" content="BozTech R&D topluluğunun etkinlik ve proje fotoğraf galerisi." />
      <link rel="canonical" href="https://boztech.com.tr/galeri" />
    </Helmet>
    <section className="archive-page section">
      <div className="container">
        <header className="archive-header">
          <h1><FiImage /> <span className="highlight">Tüm Fotoğraflar</span></h1>
        </header>

        <div className="photo-archive-grid">
          {sortedPhotos.length === 0 ? (
            <p className="archive-empty">Henüz fotoğraf bulunmuyor.</p>
          ) : (
            sortedPhotos.map((photo) => (
              <article
                key={photo._id}
                className="photo-archive-card"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedPhotoIndex(sortedPhotos.findIndex((item) => item._id === photo._id))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedPhotoIndex(sortedPhotos.findIndex((item) => item._id === photo._id));
                  }
                }}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || 'Galeri gorseli'}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/placeholders/image-fallback.svg';
                  }}
                />
                <div className="photo-archive-body">
                  <h3>{photo.title || 'Isimsiz fotograf'}</h3>
                  <p>{photo.category || 'Genel'}</p>
                  <span>{new Date(photo.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </article>
            ))
          )}
        </div>

        {selectedPhoto ? (
          <div className="photo-lightbox" onClick={handleCloseLightbox}>
            <button type="button" className="photo-lightbox-close" onClick={handleCloseLightbox} aria-label="Kapat">×</button>
            <button type="button" className="photo-lightbox-nav prev" onClick={(event) => { event.stopPropagation(); handlePrevPhoto(); }} aria-label="Onceki">‹</button>
            <figure className="photo-lightbox-content" onClick={(event) => event.stopPropagation()}>
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || 'Galeri gorseli'}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/placeholders/image-fallback.svg';
                }}
              />
              <figcaption>
                <h3>{selectedPhoto.title || 'Isimsiz fotograf'}</h3>
                <p>{selectedPhoto.category || 'Genel'}</p>
              </figcaption>
            </figure>
            <button type="button" className="photo-lightbox-nav next" onClick={(event) => { event.stopPropagation(); handleNextPhoto(); }} aria-label="Sonraki">›</button>
          </div>
        ) : null}
      </div>
    </section>
    </>
  );
}

export default PhotoGalleryPage;
