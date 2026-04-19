import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiTrash2, FiUsers, FiTarget, FiBriefcase, FiCalendar, FiFolder, FiUserPlus, FiSave, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { UNSAFE_NavigationContext, useBeforeUnload } from 'react-router-dom';
import { clubInfoService } from '../../services/clubInfoService';
import { projectService } from '../../services/projectService';
import { boardMemberService } from '../../services/boardMemberService';
import UnsavedChangesModal from './UnsavedChangesModal';

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const toMultilineText = (items = []) => items.join('\n');

const toItemArray = (textValue = '') => textValue
  .split('\n')
  .map((item) => item.trim())
  .filter(Boolean);

const createDefaultSectionForm = () => ({
  missionContent: '',
  missionVision: '',
  servicesItems: '',
  servicesStakeholders: '',
  activitiesTrainings: '',
  activitiesSeminars: '',
  activitiesEvents: '',
  membershipWhoCanJoin: '',
  membershipExpectations: '',
  membershipProcess: '',
  socialInstagram: '',
  socialLinkedin: '',
  socialYoutube: '',
});

function ClubInfoManagement() {
  const { navigator } = React.useContext(UNSAFE_NavigationContext);
  const [activeSection, setActiveSection] = useState('mission');
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionForm, setSectionForm] = useState(createDefaultSectionForm);
  const [feedback, setFeedback] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState({ isOpen: false, type: null, message: '' });
  const [pendingSection, setPendingSection] = useState(null);
  const pendingTxRef = useRef(null);
  const unblockRef = useRef(null);

  const [boardMembers, setBoardMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Resim dosyalarını formData ile aktaracak stateler
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: '', role: '', image: null, linkedin: '', github: '', email: '' });
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', longDesc: '', image: null, tag: '', tech: '' });

  useEffect(() => {
    fetchAllSections();
  }, []);

  const editableSections = useMemo(() => ['mission', 'services', 'activities', 'membership', 'socialLinks'], []);
  const leavePageMessage = 'Kaydedilmemis degisiklikler var. Bu sayfadan ayrilmak istiyor musunuz?';

  useEffect(() => {
    if (!isDirty) return undefined;
    if (!navigator || typeof navigator.block !== 'function') return undefined;

    const unblock = navigator.block((tx) => {
      if (pendingTxRef.current) return;
      pendingTxRef.current = tx;
      setLeaveWarning({
        isOpen: true,
        type: 'route',
        message: leavePageMessage,
      });
    });

    unblockRef.current = unblock;

    return () => {
      unblock();
      if (unblockRef.current === unblock) {
        unblockRef.current = null;
      }
    };
  }, [isDirty, navigator]);

  useBeforeUnload((event) => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  useEffect(() => {
    if (!editableSections.includes(activeSection)) return;
    setSectionForm(createDefaultSectionForm());
    setIsDirty(false);
  }, [activeSection, editableSections]);

  const updateSectionField = (field, value) => {
    setSectionForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const getExistingActivityItems = (nameHint) => {
    const categories = Array.isArray(sections.activities?.categories) ? sections.activities.categories : [];
    return categories.find((cat) => normalizeText(cat?.name).includes(nameHint))?.items || [];
  };

  const fetchAllSections = async () => {
    try {
      setLoading(true);
      const [boardRes, projRes, clubRes] = await Promise.all([
        boardMemberService.getAll(),
        projectService.getAll(),
        clubInfoService.getAll()
      ]);
      
      if (boardRes?.success) setBoardMembers(boardRes.data || []);
      if (projRes?.success) setProjects(projRes.data || []);

      const sectionsData = (clubRes?.success && clubRes.data) ? clubRes.data : {};
      setSections(sectionsData);
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async () => {
    if (!editableSections.includes(activeSection)) return;

    try {
      setSaving(true);
      setFeedback(null);

      let payload = {};
      const currentSection = sections[activeSection] || {};

      if (activeSection === 'mission') {
        payload = {
          title: 'Misyonumuz & Vizyonumuz',
          content: sectionForm.missionContent.trim() ? sectionForm.missionContent : (currentSection.content || ''),
          vision: sectionForm.missionVision.trim() ? sectionForm.missionVision : (currentSection.vision || ''),
        };
      }

      if (activeSection === 'services') {
        const typedItems = toItemArray(sectionForm.servicesItems);
        const typedStakeholders = toItemArray(sectionForm.servicesStakeholders);
        payload = {
          title: 'Hizmetler',
          items: typedItems.length ? typedItems : (Array.isArray(currentSection.items) ? currentSection.items : []),
          stakeholders: typedStakeholders.length ? typedStakeholders : (Array.isArray(currentSection.stakeholders) ? currentSection.stakeholders : []),
        };
      }

      if (activeSection === 'activities') {
        const typedTrainings = toItemArray(sectionForm.activitiesTrainings);
        const typedSeminars = toItemArray(sectionForm.activitiesSeminars);
        const typedEvents = toItemArray(sectionForm.activitiesEvents);

        payload = {
          title: 'Faaliyetlerimiz',
          categories: [
            { name: 'Egitimler', items: typedTrainings.length ? typedTrainings : getExistingActivityItems('egitim') },
            { name: 'Seminerler', items: typedSeminars.length ? typedSeminars : getExistingActivityItems('seminer') },
            { name: 'Etkinlikler', items: typedEvents.length ? typedEvents : getExistingActivityItems('etkinlik') },
          ],
        };
      }

      if (activeSection === 'membership') {
        const currentMembership = currentSection.content || {};
        payload = {
          title: 'Uyelik & Katilim',
          content: {
            whoCanJoin: sectionForm.membershipWhoCanJoin.trim() ? sectionForm.membershipWhoCanJoin : (currentMembership.whoCanJoin || ''),
            expectations: sectionForm.membershipExpectations.trim() ? sectionForm.membershipExpectations : (currentMembership.expectations || ''),
            process: sectionForm.membershipProcess.trim() ? sectionForm.membershipProcess : (currentMembership.process || ''),
          },
        };
      }

      if (activeSection === 'socialLinks') {
        const currentSocial = currentSection || {};
        payload = {
          title: 'Sosyal Medya',
          instagram: sectionForm.socialInstagram.trim() ? sectionForm.socialInstagram : (currentSocial.instagram || ''),
          linkedin: sectionForm.socialLinkedin.trim() ? sectionForm.socialLinkedin : (currentSocial.linkedin || ''),
          youtube: sectionForm.socialYoutube.trim() ? sectionForm.socialYoutube : (currentSocial.youtube || ''),
        };
      }

      const response = await clubInfoService.update(activeSection, payload);
      if (response.success) {
        setSections((prev) => ({ ...prev, [activeSection]: response.data }));
        setFeedback({ type: 'success', message: 'Kulup bilgi bolumu basariyla kaydedildi.' });
        setSectionForm(createDefaultSectionForm());
        setIsDirty(false);
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error?.message || 'Kaydetme sirasinda hata olustu.' });
    } finally {
      setSaving(false);
    }
  };

  const applySectionChange = (sectionName) => {
    setActiveSection(sectionName);
    setIsDirty(false);
    setSectionForm(createDefaultSectionForm());
  };

  const handleLeaveWarningCancel = () => {
    pendingTxRef.current = null;
    setPendingSection(null);
    setLeaveWarning({ isOpen: false, type: null, message: '' });
  };

  const handleLeaveWarningConfirm = () => {
    if (leaveWarning.type === 'section' && pendingSection) {
      applySectionChange(pendingSection);
    }

    if (leaveWarning.type === 'route' && pendingTxRef.current) {
      const tx = pendingTxRef.current;
      const unblock = unblockRef.current;
      pendingTxRef.current = null;
      if (unblock) {
        unblock();
        unblockRef.current = null;
      }
      setIsDirty(false);
      tx.retry();
    }

    setPendingSection(null);
    setLeaveWarning({ isOpen: false, type: null, message: '' });
  };

  const handleLoadCurrentContentToForm = () => {
    if (!editableSections.includes(activeSection)) return;

    const section = sections[activeSection] || {};

    if (activeSection === 'mission') {
      setSectionForm((prev) => ({
        ...prev,
        missionContent: section.content || '',
        missionVision: section.vision || '',
      }));
    }

    if (activeSection === 'services') {
      setSectionForm((prev) => ({
        ...prev,
        servicesItems: toMultilineText(Array.isArray(section.items) ? section.items : []),
        servicesStakeholders: toMultilineText(Array.isArray(section.stakeholders) ? section.stakeholders : []),
      }));
    }

    if (activeSection === 'activities') {
      const categories = Array.isArray(section.categories) ? section.categories : [];
      const trainings = categories.find((cat) => normalizeText(cat?.name).includes('egitim'));
      const seminars = categories.find((cat) => normalizeText(cat?.name).includes('seminer'));
      const events = categories.find((cat) => normalizeText(cat?.name).includes('etkinlik'));

      setSectionForm((prev) => ({
        ...prev,
        activitiesTrainings: toMultilineText(Array.isArray(trainings?.items) ? trainings.items : []),
        activitiesSeminars: toMultilineText(Array.isArray(seminars?.items) ? seminars.items : []),
        activitiesEvents: toMultilineText(Array.isArray(events?.items) ? events.items : []),
      }));
    }

    if (activeSection === 'membership') {
      const membership = section.content || section;
      setSectionForm((prev) => ({
        ...prev,
        membershipWhoCanJoin: membership?.whoCanJoin || '',
        membershipExpectations: membership?.expectations || '',
        membershipProcess: membership?.process || '',
      }));
    }

    if (activeSection === 'socialLinks') {
      setSectionForm((prev) => ({
        ...prev,
        socialInstagram: section.instagram || '',
        socialLinkedin: section.linkedin || '',
        socialYoutube: section.youtube || '',
      }));
    }

    setIsDirty(true);
    setFeedback({ type: 'success', message: 'Mevcut yayin icerigi forma aktarildi. Duzenleyip kaydedebilirsiniz.' });
  };

  const handleSectionChange = (sectionName) => {
    if (sectionName === activeSection) return;

    if (editableSections.includes(activeSection) && isDirty) {
      setPendingSection(sectionName);
      setLeaveWarning({
        isOpen: true,
        type: 'section',
        message: 'Kaydedilmemis degisiklikler var. Bu bolumden ayrilmak istiyor musunuz?',
      });
      return;
    }

    applySectionChange(sectionName);
  };

  // ----- BOARD MEMBER METHODS -----
  const handleCreateBoardMember = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', boardForm.name);
      fd.append('role', boardForm.role);
      if (boardForm.linkedin) fd.append('linkedin', boardForm.linkedin);
      if (boardForm.github) fd.append('github', boardForm.github);
      if (boardForm.email) fd.append('email', boardForm.email);
      if (boardForm.image) fd.append('image', boardForm.image);

      const res = await boardMemberService.create(fd);
      if (res.success) {
        setBoardMembers([res.data, ...boardMembers]);
        setShowBoardForm(false);
        setBoardForm({ name: '', role: '', image: null, linkedin: '', github: '', email: '' });
      }
      setFeedback({ type: 'success', message: 'Yonetim kurulu uyesi eklendi.' });
    } catch(err) {
      setFeedback({ type: 'error', message: 'Yonetim kurulu uyesi eklenemedi.' });
    }
  };

  const handleDeleteBoardMember = async (id) => {
    if(!window.confirm('Bu uyeyi silmek istediginize emin misiniz?')) return;
    try {
      await boardMemberService.deleteMember(id);
      setBoardMembers(boardMembers.filter(m => m._id !== id));
      setFeedback({ type: 'success', message: 'Yonetim kurulu uyesi silindi.' });
    } catch(err) {
      setFeedback({ type: 'error', message: 'Yonetim kurulu uyesi silinemedi.' });
    }
  };

  // ----- PROJECT METHODS -----
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', projectForm.title);
      fd.append('desc', projectForm.desc);
      fd.append('longDesc', projectForm.longDesc);
      fd.append('tag', projectForm.tag);
      if (projectForm.tech) fd.append('tech', projectForm.tech); // Controller da ayıracak (virgül formatında)
      if (projectForm.image) fd.append('image', projectForm.image);

      const res = await projectService.create(fd);
      if (res.success) {
        setProjects([res.data, ...projects]);
        setShowProjectForm(false);
        setProjectForm({ title: '', desc: '', longDesc: '', image: null, tag: '', tech: '' });
      }
      setFeedback({ type: 'success', message: 'Proje eklendi.' });
    } catch(err) {
      setFeedback({ type: 'error', message: 'Proje eklenemedi.' });
    }
  };

  const handleDeleteProject = async (id) => {
    if(!window.confirm('Projeyi silmek istediginize emin misiniz?')) return;
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      setFeedback({ type: 'success', message: 'Proje silindi.' });
    } catch(err) {
      setFeedback({ type: 'error', message: 'Proje silinemedi.' });
    }
  };

  // -------------- RENDERERS --------------
  const renderBoardSection = () => {
    return (
      <div className="board-management-section">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
           <button onClick={() => setShowBoardForm(true)} className="btn btn-primary"><FiPlus/> Yeni Üye Ekle</button>
        </div>
        
        {showBoardForm && (
          <form style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }} onSubmit={handleCreateBoardMember}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="text" placeholder="Ad Soyad" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={boardForm.name} onChange={e => setBoardForm({...boardForm, name: e.target.value})} required/>
              <input type="text" placeholder="Görevi (Başkan vb.)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={boardForm.role} onChange={e => setBoardForm({...boardForm, role: e.target.value})} required/>
              <div style={{ gridColumn: '1 / -1', padding: '12px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                 <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Profil Fotoğrafı Seçin</label>
                 <input type="file" accept="image/*" onChange={e => setBoardForm({...boardForm, image: e.target.files[0]})} required/>
              </div>
              <input type="url" placeholder="LinkedIn Profil Linki (İsteğe Bağlı)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={boardForm.linkedin} onChange={e => setBoardForm({...boardForm, linkedin: e.target.value})} />
              <input type="url" placeholder="Github Profil Linki (İsteğe Bağlı)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={boardForm.github} onChange={e => setBoardForm({...boardForm, github: e.target.value})} />
              <input type="email" placeholder="E-Posta Adresi (İsteğe Bağlı)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', gridColumn: '1 / -1' }} value={boardForm.email} onChange={e => setBoardForm({...boardForm, email: e.target.value})} />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowBoardForm(false)}>İptal</button>
              <button type="submit" className="btn btn-primary">Kaydet</button>
            </div>
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {boardMembers.map(m => (
            <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', textAlign: 'center' }}>
               <img src={m.img} alt={m.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px', border: '2px solid #e2e8f0' }} />
               <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{m.name}</h4>
               <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>{m.role}</p>
               <button onClick={() => handleDeleteBoardMember(m._id)} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '6px', width: '100%', marginTop: 'auto' }}><FiTrash2/> Sil</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectsSection = () => {
    return (
      <div className="projects-management-section">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
           <button onClick={() => setShowProjectForm(true)} className="btn btn-primary"><FiPlus/> Yeni Proje Ekle</button>
        </div>
        
        {showProjectForm && (
          <form style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }} onSubmit={handleCreateProject}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <input type="text" placeholder="Proje Başlığı" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required/>
              <input type="text" placeholder="Kategori (Tag) (Örn: Yapay Zeka)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={projectForm.tag} onChange={e => setProjectForm({...projectForm, tag: e.target.value})} required/>
              
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                 <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Proje Kapak Görseli Seçin</label>
                 <input type="file" accept="image/*" onChange={e => setProjectForm({...projectForm, image: e.target.files[0]})} required/>
              </div>

              <input type="text" placeholder="Kısa Açıklama (Kart Gösterimi)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} required/>
              <textarea placeholder="Uzun Detay (Detay Sayfası için)" rows={4} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={projectForm.longDesc} onChange={e => setProjectForm({...projectForm, longDesc: e.target.value})} required/>
              <input type="text" placeholder="Kullanılan Teknolojiler (Virgülle ayırın, Örn: Python, YOLO, React)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={projectForm.tech} onChange={e => setProjectForm({...projectForm, tech: e.target.value})} />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowProjectForm(false)}>İptal</button>
              <button type="submit" className="btn btn-primary">Kaydet</button>
            </div>
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {projects.map(p => (
            <div key={p._id} style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
               <img src={p.img} alt={p.title} style={{ width: '100%', height: '140px', borderRadius: '8px', objectFit: 'cover', marginBottom: '12px' }} />
               <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{p.title}</h4>
               <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>{p.tag} &middot; {p.tech?.join(', ')}</p>
               <button onClick={() => handleDeleteProject(p._id)} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '6px', width: '100%', marginTop: 'auto' }}><FiTrash2/> Sil</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCurrentSectionPreview = () => {
    const section = sections[activeSection] || {};

    if (activeSection === 'mission') {
      return (
        <aside className="section-preview-card">
          <h4>Mevcut Yayin Icerigi</h4>
          <div className="preview-block">
            <h5>Misyon</h5>
            <p>{section.content || 'Bu alan henuz doldurulmamis.'}</p>
          </div>
          <div className="preview-block">
            <h5>Vizyon</h5>
            <p>{section.vision || 'Bu alan henuz doldurulmamis.'}</p>
          </div>
        </aside>
      );
    }

    if (activeSection === 'services') {
      return (
        <aside className="section-preview-card">
          <h4>Mevcut Yayin Icerigi</h4>
          <div className="preview-block">
            <h5>Uyelere Sunulan Hizmetler</h5>
            <ul className="preview-list">
              {(section.items || []).map((item, index) => <li key={`service-${index}`}>{item}</li>)}
            </ul>
            {!(section.items || []).length && <p className="preview-empty">Liste bos.</p>}
          </div>
          <div className="preview-block">
            <h5>Dis Paydas Katkilari</h5>
            <ul className="preview-list">
              {(section.stakeholders || []).map((item, index) => <li key={`stake-${index}`}>{item}</li>)}
            </ul>
            {!(section.stakeholders || []).length && <p className="preview-empty">Liste bos.</p>}
          </div>
        </aside>
      );
    }

    if (activeSection === 'activities') {
      const categories = Array.isArray(section.categories) ? section.categories : [];
      const trainings = categories.find((cat) => normalizeText(cat?.name).includes('egitim'));
      const seminars = categories.find((cat) => normalizeText(cat?.name).includes('seminer'));
      const events = categories.find((cat) => normalizeText(cat?.name).includes('etkinlik'));

      return (
        <aside className="section-preview-card">
          <h4>Mevcut Yayin Icerigi</h4>
          <div className="preview-block">
            <h5>Egitimler</h5>
            <ul className="preview-list">
              {(trainings?.items || []).map((item, index) => <li key={`train-${index}`}>{item}</li>)}
            </ul>
            {!(trainings?.items || []).length && <p className="preview-empty">Liste bos.</p>}
          </div>
          <div className="preview-block">
            <h5>Seminerler</h5>
            <ul className="preview-list">
              {(seminars?.items || []).map((item, index) => <li key={`seminar-${index}`}>{item}</li>)}
            </ul>
            {!(seminars?.items || []).length && <p className="preview-empty">Liste bos.</p>}
          </div>
          <div className="preview-block">
            <h5>Etkinlikler</h5>
            <ul className="preview-list">
              {(events?.items || []).map((item, index) => <li key={`event-${index}`}>{item}</li>)}
            </ul>
            {!(events?.items || []).length && <p className="preview-empty">Liste bos.</p>}
          </div>
        </aside>
      );
    }

    if (activeSection === 'socialLinks') {
      return (
        <aside className="section-preview-card">
          <h4>Mevcut Yayin Icerigi</h4>
          <div className="preview-block">
            <h5>Instagram</h5>
            <p>{section.instagram || 'Bu alan henuz doldurulmamis.'}</p>
          </div>
          <div className="preview-block">
            <h5>LinkedIn</h5>
            <p>{section.linkedin || 'Bu alan henuz doldurulmamis.'}</p>
          </div>
          <div className="preview-block">
            <h5>YouTube</h5>
            <p>{section.youtube || 'Bu alan henuz doldurulmamis.'}</p>
          </div>
        </aside>
      );
    }

    const membership = section.content || section;
    return (
      <aside className="section-preview-card">
        <h4>Mevcut Yayin Icerigi</h4>
        <div className="preview-block">
          <h5>Kimler Katilabilir?</h5>
          <p>{membership?.whoCanJoin || 'Bu alan henuz doldurulmamis.'}</p>
        </div>
        <div className="preview-block">
          <h5>Uyelerden Beklentiler</h5>
          <p>{membership?.expectations || 'Bu alan henuz doldurulmamis.'}</p>
        </div>
        <div className="preview-block">
          <h5>Basvuru Sureci</h5>
          <p>{membership?.process || 'Bu alan henuz doldurulmamis.'}</p>
        </div>
      </aside>
    );
  };

  const renderEditorWithPreview = (editorFields) => (
    <div className="club-info-editor-grid">
      <div className="edit-mode">{editorFields}</div>
      {renderCurrentSectionPreview()}
    </div>
  );

  const renderSectionEditor = () => {
    if (activeSection === 'board') return renderBoardSection();
    if (activeSection === 'projects') return renderProjectsSection();

    if (activeSection === 'mission') {
      return renderEditorWithPreview(
        <>
          <div className="form-group">
            <label>Misyon Metni</label>
            <textarea
              rows={6}
              value={sectionForm.missionContent}
              onChange={(e) => updateSectionField('missionContent', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Vizyon Metni</label>
            <textarea
              rows={6}
              value={sectionForm.missionVision}
              onChange={(e) => updateSectionField('missionVision', e.target.value)}
            />
          </div>
        </>
      );
    }

    if (activeSection === 'services') {
      return renderEditorWithPreview(
        <>
          <div className="form-group">
            <label>Uyelere Sunulan Hizmetler (Her satira 1 madde)</label>
            <textarea
              rows={8}
              value={sectionForm.servicesItems}
              onChange={(e) => updateSectionField('servicesItems', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Dis Paydaslara Katkilar (Her satira 1 madde)</label>
            <textarea
              rows={8}
              value={sectionForm.servicesStakeholders}
              onChange={(e) => updateSectionField('servicesStakeholders', e.target.value)}
            />
          </div>
        </>
      );
    }

    if (activeSection === 'activities') {
      return renderEditorWithPreview(
        <>
          <div className="form-group">
            <label>Egitimler (Her satira 1 faaliyet)</label>
            <textarea
              rows={6}
              value={sectionForm.activitiesTrainings}
              onChange={(e) => updateSectionField('activitiesTrainings', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Seminerler (Her satira 1 faaliyet)</label>
            <textarea
              rows={6}
              value={sectionForm.activitiesSeminars}
              onChange={(e) => updateSectionField('activitiesSeminars', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Etkinlikler (Her satira 1 faaliyet)</label>
            <textarea
              rows={6}
              value={sectionForm.activitiesEvents}
              onChange={(e) => updateSectionField('activitiesEvents', e.target.value)}
            />
          </div>
        </>
      );
    }

    if (activeSection === 'socialLinks') {
      return renderEditorWithPreview(
        <>
          <div className="form-group">
            <label><FiInstagram /> Instagram Linki</label>
            <input
              type="url"
              placeholder="https://instagram.com/kulup-hesabi"
              value={sectionForm.socialInstagram}
              onChange={(e) => updateSectionField('socialInstagram', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label><FiLinkedin /> LinkedIn Linki</label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/company/..."
              value={sectionForm.socialLinkedin}
              onChange={(e) => updateSectionField('socialLinkedin', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label><FiYoutube /> YouTube Linki</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/@kanaladi"
              value={sectionForm.socialYoutube}
              onChange={(e) => updateSectionField('socialYoutube', e.target.value)}
            />
          </div>
        </>
      );
    }

    return renderEditorWithPreview(
      <>
        <div className="form-group">
          <label>Kimler Katilabilir?</label>
          <textarea
            rows={5}
            value={sectionForm.membershipWhoCanJoin}
            onChange={(e) => updateSectionField('membershipWhoCanJoin', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Uyelerden Beklentiler</label>
          <textarea
            rows={5}
            value={sectionForm.membershipExpectations}
            onChange={(e) => updateSectionField('membershipExpectations', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Basvuru Sureci</label>
          <textarea
            rows={5}
            value={sectionForm.membershipProcess}
            onChange={(e) => updateSectionField('membershipProcess', e.target.value)}
          />
        </div>
      </>
    );
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>Kulüp Bilgi Yönetimi</h2>
        {editableSections.includes(activeSection) && (
          <div className="header-actions">
            <button className="btn btn-outline" onClick={handleLoadCurrentContentToForm} disabled={saving}>
              Mevcut Icerigi Forma Getir
            </button>
            <button className="btn btn-primary" onClick={handleSaveSection} disabled={saving}>
              <FiSave /> {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
            </button>
          </div>
        )}
      </div>

      {feedback ? (
        <div className={`admin-feedback ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Bildirimi kapat">×</button>
        </div>
      ) : null}

      <div className="club-info-layout">
        <div className="info-sidebar">
          <ul>
            <li className={activeSection === 'mission' ? 'active' : ''} onClick={() => handleSectionChange('mission')}><FiTarget /> Misyon & Vizyon</li>
            <li className={activeSection === 'services' ? 'active' : ''} onClick={() => handleSectionChange('services')}><FiBriefcase /> Hizmetler</li>
            <li className={activeSection === 'board' ? 'active' : ''} onClick={() => handleSectionChange('board')}><FiUsers /> Yönetim Kurulu</li>
            <li className={activeSection === 'activities' ? 'active' : ''} onClick={() => handleSectionChange('activities')}><FiCalendar /> Faaliyetler</li>
            <li className={activeSection === 'projects' ? 'active' : ''} onClick={() => handleSectionChange('projects')}><FiFolder /> Projeler</li>
            <li className={activeSection === 'membership' ? 'active' : ''} onClick={() => handleSectionChange('membership')}><FiUserPlus /> Üyelik</li>
            <li className={activeSection === 'socialLinks' ? 'active' : ''} onClick={() => handleSectionChange('socialLinks')}><FiInstagram /> Sosyal Medya</li>
          </ul>
        </div>
        <div className="info-content">
          <div className="info-header">
             <h3>
                {activeSection === 'board' ? 'Yönetim Kurulu' : 
                 activeSection === 'projects' ? 'Geliştirdiğimiz Projeler' : 
                 (sections[activeSection]?.title || 'Kulup Bilgi Bolumu')}
             </h3>
          </div>
          <div className="info-body">{renderSectionEditor()}</div>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={leaveWarning.isOpen}
        message={leaveWarning.message}
        onCancel={handleLeaveWarningCancel}
        onConfirm={handleLeaveWarningConfirm}
      />
    </div>
  );
}

export default ClubInfoManagement;