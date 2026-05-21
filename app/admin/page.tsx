'use client';

import { useState } from 'react';
import { AdminLogin } from '@/components/admin-login';
import { AdminDashboard } from '@/components/admin-dashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
}
