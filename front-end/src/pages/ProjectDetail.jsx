import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { FaArrowLeft, FaCode } from 'react-icons/fa';
import '../styles/ClubInfo.css';
import { projectService } from '../services/projectService';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectService.getById(projectId);
        if (res.success) setProject(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <div className="container section fade-in" style={{ textAlign: 'center', padding: '100px 0' }}><h2>Proje Detayları İndiriliyor...</h2></div>;
  if (!project) return <div className="container section fade-in" style={{ textAlign: 'center', padding: '100px 0' }}><h2>Aradığınız Proje Veritabanında Bulunamadı.</h2></div>;

  return (
    <div className="container section fade-in">
      <button onClick={() => navigate(-1)} className="btn-back">
        <FaArrowLeft /> Geri Dön
      </button>

      <div className="project-detail-grid">
        <div className="detail-image">
          <img src={project.img} alt={project.title} />
        </div>
        
        <div className="detail-info">
          <span className="project-tag">{project.tag}</span>
          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-text-long">{project.longDesc}</p>
          
          <div className="tech-stack">
            <h3><FaCode /> Kullanılan Teknolojiler</h3>
            <div className="tech-tags">
              {project.tech && project.tech.length > 0 ? (
                 project.tech.map((t, i) => <span key={i} className="tech-tag">{t}</span>)
              ) : <span className="text-muted">Belirtilmedi</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;