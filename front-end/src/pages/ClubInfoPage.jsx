import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiBriefcase,
  FiCpu,
  FiExternalLink,
  FiFlag,
  FiLayers,
  FiMapPin,
  FiTarget,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';
import { boardMemberService } from '../services/boardMemberService';
import { clubInfoService } from '../services/clubInfoService';
import { projectService } from '../services/projectService';
import '../styles/ClubInfoPage.css';

const NAV_ITEMS = [
  { id: 'mission', label: 'Misyonumuz & Vizyonumuz', icon: <FiTarget /> },
  { id: 'services', label: 'Hizmetler', icon: <FiBriefcase />, subItems: ['Uyelere sunulan imkanlar', 'Dis paydaslara saglanan katkilar'] },
  { id: 'board', label: 'Yonetim Kurulu', icon: <FiUsers />, subItems: ['Gorev / rol bazli listeleme'] },
  { id: 'activities', label: 'Faaliyetlerimiz', icon: <FiBookOpen />, subItems: ['Egitimler', 'Seminerler', 'Etkinlikler'] },
  { id: 'projects', label: 'Projelerimiz', icon: <FiCpu />, subItems: ['Tum projeler ve yarisma calismalari'] },
  { id: 'membership', label: 'Uyelik & Katilim', icon: <FiUserPlus />, subItems: ['Kimler katilabilir?', 'Uyelerden beklentiler', 'Basvuru sureci'] },
];

const getSectionIcon = (categoryName) => {
  const normalized = String(categoryName || '').toLowerCase();
  if (normalized.includes('egitim')) return <FiBookOpen />;
  if (normalized.includes('seminer')) return <FiLayers />;
  return <FiMapPin />;
};

const normalizeProjectEntry = (item) => {
  if (typeof item === 'string') {
    return { title: item, description: '', tag: '', _id: null, award: '', year: '' };
  }

  return {
    title: item?.title || item?.name || 'Isimsiz Kayit',
    description: item?.description || item?.desc || item?.summary || '',
    tag: item?.tag || item?.category || '',
    _id: item?._id || item?.projectId || null,
    award: item?.award || item?.ranking || '',
    year: item?.year || '',
  };
};

const getProjectsFromSectionData = (sectionProjects) => {
  if (!sectionProjects || typeof sectionProjects !== 'object') {
    return [];
  }

  if (Array.isArray(sectionProjects.items)) {
    return sectionProjects.items.map(normalizeProjectEntry);
  }

  const merged = [];
  ['ongoing', 'completed', 'competitions'].forEach((key) => {
    if (Array.isArray(sectionProjects[key])) {
      merged.push(...sectionProjects[key].map(normalizeProjectEntry));
    }
  });

  return merged;
};

function ClubInfoPage() {
  const [activeSection, setActiveSection] = useState('mission');
  const [sections, setSections] = useState({});
  const [boardMembers, setBoardMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const [clubInfoRes, boardRes, projectRes] = await Promise.all([
          clubInfoService.getAll(),
          boardMemberService.getAll(),
          projectService.getAll()
        ]);

        if (clubInfoRes?.success && clubInfoRes.data) {
          setSections(clubInfoRes.data);
        }

        if (boardRes?.success) {
          setBoardMembers(boardRes.data || []);
        }

        if (projectRes?.success) {
          setProjects(projectRes.data || []);
        }
      } catch (fetchError) {
        console.error('Kulup bilgi verileri yuklenemedi:', fetchError);
        setError('Kulup bilgi verileri yuklenirken bir hata olustu.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const missionContent = {
    missionText: sections?.mission?.content || '',
    visionText: sections?.mission?.vision || ''
  };

  const servicesContent = {
    items: Array.isArray(sections?.services?.items) && sections.services.items.length > 0
      ? sections.services.items
      : [],
    stakeholders: Array.isArray(sections?.services?.stakeholders) && sections.services.stakeholders.length > 0
      ? sections.services.stakeholders
      : []
  };

  const activitiesContent = useMemo(() => {
    const categories = Array.isArray(sections?.activities?.categories) && sections.activities.categories.length > 0
      ? sections.activities.categories
      : [];

    return categories.map((category) => ({
      name: category?.name || 'Kategori',
      items: Array.isArray(category?.items) ? category.items : []
    }));
  }, [sections]);

  const membershipRaw = sections?.membership?.content || sections?.membership || {};
  const membershipContent = {
    whoCanJoin: membershipRaw.whoCanJoin || '',
    expectations: membershipRaw.expectations || '',
    process: membershipRaw.process || '',
  };

  const groupedBoardMembers = useMemo(() => {
    return boardMembers.reduce((groups, member) => {
      const role = member?.role || 'Belirtilmemis Rol';
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(member);
      return groups;
    }, {});
  }, [boardMembers]);

  const roleEntries = useMemo(() => {
    return Object.entries(groupedBoardMembers).sort((a, b) => a[0].localeCompare(b[0], 'tr'));
  }, [groupedBoardMembers]);

  const sectionProjects = useMemo(() => getProjectsFromSectionData(sections?.projects), [sections]);
  const projectContent = sectionProjects.length > 0
    ? sectionProjects
    : projects.map(normalizeProjectEntry);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'mission':
        return (
          <div className="club-panel-grid two-columns">
            <article className="club-card">
              <h3><FiFlag /> Misyonumuz</h3>
              {missionContent.missionText ? <p>{missionContent.missionText}</p> : <p className="club-empty-text">Misyon bilgisi henuz eklenmemis.</p>}
            </article>
            <article className="club-card">
              <h3><FiTarget /> Vizyonumuz</h3>
              {missionContent.visionText ? <p>{missionContent.visionText}</p> : <p className="club-empty-text">Vizyon bilgisi henuz eklenmemis.</p>}
            </article>
          </div>
        );

      case 'services':
        return (
          <div className="club-panel-grid two-columns">
            <article className="club-card">
              <h3><FiBriefcase /> Uyeler Icin Hizmetler</h3>
              {servicesContent.items.length === 0 ? (
                <p className="club-empty-text">Uyelere yonelik hizmet bilgisi henuz eklenmemis.</p>
              ) : (
                <ul className="club-list">
                  {servicesContent.items.map((service, index) => (
                    <li key={`${service}-${index}`}>{service}</li>
                  ))}
                </ul>
              )}
            </article>

            <article className="club-card">
              <h3><FiUsers /> Dis Paydaslara Katkilar</h3>
              {servicesContent.stakeholders.length === 0 ? (
                <p className="club-empty-text">Dis paydas katkisi bilgisi henuz eklenmemis.</p>
              ) : (
                <ul className="club-list">
                  {servicesContent.stakeholders.map((service, index) => (
                    <li key={`${service}-${index}`}>{service}</li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        );

      case 'board':
        return roleEntries.length === 0 ? (
          <p className="club-empty-text">Yonetim kurulu verisi henuz eklenmemis.</p>
        ) : (
          <div className="club-board-groups">
            {roleEntries.map(([role, members]) => (
              <section key={role} className="club-role-group">
                <h3>{role}</h3>
                <div className="club-board-grid">
                  {members.map((member) => (
                    <article key={member._id} className="club-member-card">
                      <img
                        src={member.img || 'https://via.placeholder.com/160'}
                        alt={member.name}
                        onError={(event) => {
                          event.currentTarget.src = 'https://via.placeholder.com/160';
                        }}
                      />
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                      <div className="club-member-links">
                        {member.linkedin && member.linkedin !== '#' ? <a href={member.linkedin} target="_blank" rel="noreferrer"><FaLinkedin /></a> : null}
                        {member.github && member.github !== '#' ? <a href={member.github} target="_blank" rel="noreferrer"><FaGithub /></a> : null}
                        {member.email ? <a href={`mailto:${member.email}`}><FaEnvelope /></a> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        );

      case 'activities':
        if (activitiesContent.length === 0) {
          return <p className="club-empty-text">Faaliyet verisi henuz eklenmemis.</p>;
        }

        return (
          <div className="club-panel-grid three-columns">
            {activitiesContent.map((category) => (
              <article key={category.name} className="club-card">
                <h3>
                  {getSectionIcon(category.name)}
                  {category.name}
                </h3>
                {category.items.length === 0 ? (
                  <p className="club-empty-text">Bu kategori icin kayit bulunamadi.</p>
                ) : (
                  <ul className="club-list">
                    {category.items.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="club-project-board">
            {projectContent.length === 0 ? (
              <p className="club-empty-text">Henuz proje kaydi bulunamadi.</p>
            ) : (
              projectContent.map((item, index) => (
                <article key={`${item._id || item.title}-${index}`} className="club-project-tile">
                  <div className="club-project-title-row">
                    <h3>{item.title}</h3>
                    {item.tag ? <span className="club-tag">{item.tag}</span> : null}
                  </div>

                  <p>{item.description || 'Bu proje icin aciklama henuz eklenmemis.'}</p>

                  {(item.award || item.year) ? (
                    <div className="club-project-meta">
                      {item.award ? <span className="club-award">{item.award}</span> : null}
                      {item.year ? <span className="club-year">{item.year}</span> : null}
                    </div>
                  ) : null}

                  {item._id ? (
                    <Link to={`/projeler/${item._id}`} className="club-project-link">
                      Proje Detayi <FiExternalLink />
                    </Link>
                  ) : null}
                </article>
              ))
            )}
          </div>
        );

      case 'membership':
        return (
          <div className="club-panel-grid three-columns">
            <article className="club-card">
              <h3><FiUsers /> Kimler Katilabilir?</h3>
              {membershipContent.whoCanJoin ? <p>{membershipContent.whoCanJoin}</p> : <p className="club-empty-text">Bu alan henuz eklenmemis.</p>}
            </article>
            <article className="club-card">
              <h3><FiTarget /> Uyelerden Beklentiler</h3>
              {membershipContent.expectations ? <p>{membershipContent.expectations}</p> : <p className="club-empty-text">Bu alan henuz eklenmemis.</p>}
            </article>
            <article className="club-card">
              <h3><FiUserPlus /> Basvuru Sureci</h3>
              {membershipContent.process ? <p>{membershipContent.process}</p> : <p className="club-empty-text">Bu alan henuz eklenmemis.</p>}
            </article>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="club-info-page section">
        <div className="container">
          <div className="club-loading">Kulup bilgileri yukleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="club-info-page section">
      <div className="container">
        <div className="club-layout">
          <aside className="club-sidebar" aria-label="Kulup Bilgi Menusu">
            <div className="club-sidebar-head">
              <h2>Kulup Bilgi Sayfasi</h2>
              <p>Soldaki menuden bolum secerek icerikleri goruntuleyebilirsiniz.</p>
            </div>

            <nav className="club-nav-list">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`club-nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="club-nav-icon">{item.icon}</span>
                  <span className="club-nav-content">
                    <strong>{item.label}</strong>
                    {item.subItems ? (
                      <span className="club-nav-subitems">
                        {item.subItems.join(' • ')}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="club-main-panel">
            <header className="club-main-head">
              <h1>{NAV_ITEMS.find((item) => item.id === activeSection)?.label}</h1>
              {error ? <p className="club-error-text">{error}</p> : null}
            </header>

            {renderSectionContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ClubInfoPage;