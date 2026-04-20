import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu } from 'react-icons/fi';
import { projectService } from '../services/projectService';
import '../styles/ArchivePages.css';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAll();
        if (response?.success) {
          setProjects(response.data || []);
        }
      } catch (error) {
        console.error('Projeler yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [projects]);

  if (loading) {
    return <div className="archive-page container">Yukleniyor...</div>;
  }

  return (
    <section className="archive-page section">
      <div className="container">
        <header className="archive-header">
          <h1><FiCpu /> Tum Projeler</h1>
        </header>

        <div className="archive-grid">
          {sortedProjects.length === 0 ? (
            <p className="archive-empty">Henuz proje bulunmuyor.</p>
          ) : (
            sortedProjects.map((project) => (
              <article key={project._id} className="archive-card">
                <div className="archive-card-head">
                  <span className="archive-pill archive-project">{project.tag || 'Proje'}</span>
                  <span className="archive-date">{new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.desc || 'Bu proje icin aciklama henuz eklenmedi.'}</p>
                <Link to={`/projeler/${project._id}`} className="archive-link">Detayı Aç</Link>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ProjectsPage;
