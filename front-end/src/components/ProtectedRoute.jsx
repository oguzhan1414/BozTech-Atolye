import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('=== PROTECTED ROUTE DEBUG ===');
  console.log('Token:', token);
  console.log('User Role:', userRole);
  console.log('Current URL:', window.location.pathname);

  // Token varsa ve rol admin veya editor ise children'ı göster
  if (token && ['admin', 'editor'].includes(userRole)) {
    console.log('✅ Yetki var, panel gösteriliyor');
    return children;
  }

  // Yetki yoksa login sayfasına yönlendir
  console.log('❌ Yetki yok, login sayfasına yönlendiriliyor');
  return <Navigate to="/admin" replace />;
}

export default ProtectedRoute;