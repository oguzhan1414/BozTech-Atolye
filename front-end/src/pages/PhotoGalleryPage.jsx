import React, { useEffect, useMemo, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { photoService } from '../services/photoService';
import '../styles/ArchivePages.css';

function PhotoGalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="archive-page container">Yukleniyor...</div>;
  }

  return (
    <section className="archive-page section">
      <div className="container">
        <header className="archive-header">
          <h1><FiImage /> Tum Fotoğraflar</h1>
          <p>Galeri kayitlari en yeniden eskiye dogru listelenir.</p>
        </header>

        <div className="photo-archive-grid">
          {sortedPhotos.length === 0 ? (
            <p className="archive-empty">Henüz fotoğraf bulunmuyor.</p>
          ) : (
            sortedPhotos.map((photo) => (
              <article key={photo._id} className="photo-archive-card">
                <img
                  src={photo.imageUrl}
                  alt={photo.title || 'Galeri gorseli'}
                  onError={(event) => {
                    event.currentTarget.src = 'https://via.placeholder.com/640x420?text=Gorsel+Yok';
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
      </div>
    </section>
  );
}

export default PhotoGalleryPage;
