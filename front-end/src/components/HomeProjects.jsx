import React from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiExternalLink } from 'react-icons/fi';

function HomeProjects({ projects = [] }) {
  const previewProjects = projects.slice(0, 3);

  return (
    <section className="section home-projects-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <FiFolder size={24} />
            <h2><span className="highlight">Projeler</span></h2>
          </div>
          <div className="section-header-actions">
            <span className="section-meta-pill">Toplam {projects.length} proje</span>
            <Link to="/projeler" className="section-view-link">
              Tümünü Görüntüle
            </Link>
          </div>
        </div>

        {previewProjects.length === 0 ? (
          <p className="announcement-empty">Henuz proje kaydi bulunmuyor.</p>
        ) : (
          <div className="home-projects-grid">
            {previewProjects.map((project) => (
              <article key={project._id} className="home-project-card">
                <div className="home-project-image-wrap">
                  <img
                    src={project.img}
                    alt={project.title}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/placeholders/project-fallback.svg';
                    }}
                  />
                </div>
                <div className="home-project-body">
                  <span className="home-project-tag">{project.tag || 'Proje'}</span>
                  <h3>{project.title}</h3>
                  <p>{project.desc || 'Bu proje icin aciklama henuz eklenmedi.'}</p>
                  <Link to={`/projeler/${project._id}`} className="home-project-link">
                    Detayları Gör <FiExternalLink />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeProjects;
