import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminPanel/AdminLayout';
import Dashboard from '../components/AdminPanel/Dashboard';
import AnnouncementManagement from '../components/AdminPanel/AnnouncementManagement';
import EventManagement from '../components/AdminPanel/EventManagement';
import PhotoManagement from '../components/AdminPanel/PhotoManagement';
import Settings from '../components/AdminPanel/Settings'
import ClubInfoManagement from '../components/AdminPanel/ClubInfoManagement';
import UserManagement from '../components/AdminPanel/UserManagement'
import ApplicationsManagement from '../components/AdminPanel/ApplicationsManagement';

function AdminPage() {
  const isAuthenticated = localStorage.getItem('token') ? true : false;
  const userRole = localStorage.getItem('userRole') || 'viewer';
  const storedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');

  const hasPermission = (permission) => {
    if (userRole === 'admin') return true;
    if (!permission) return true;
    return Boolean(storedPermissions?.[permission]);
  };

  if (!isAuthenticated || !['admin', 'editor'].includes(userRole)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* /admin/panel sayfası */}
        <Route index element={<Dashboard />} />
        {/* /admin/panel/dashboard sayfası */}
        <Route path="dashboard" element={<Dashboard />} />
        {/* /admin/panel/announcements sayfası */}
        <Route path="announcements" element={hasPermission('announcements') ? <AnnouncementManagement /> : <Navigate to="/admin/panel" replace />} />
        <Route path="events" element={hasPermission('events') ? <EventManagement /> : <Navigate to="/admin/panel" replace />} />
        <Route path="photos" element={hasPermission('photos') ? <PhotoManagement /> : <Navigate to="/admin/panel" replace />} />
        <Route path="settings" element={<Settings/>}></Route>
        <Route path="club-info" element={hasPermission('clubInfo') ? <ClubInfoManagement/> : <Navigate to="/admin/panel" replace />}></Route>
        <Route path="users" element={hasPermission('users') ? <UserManagement/> : <Navigate to="/admin/panel" replace />}></Route>
        <Route path="applications" element={hasPermission('applications') ? <ApplicationsManagement/> : <Navigate to="/admin/panel" replace />}></Route>
        

      </Route>
    </Routes>
  );
}

export default AdminPage;