'use client';

import { useState } from 'react';
import { AdminLogin } from '@/components/admin-login';
import { AdminDashboard } from '@/components/admin-dashboard';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<string | null>(null);

  if (!adminUser) {
    return <AdminLogin onSuccess={(username) => setAdminUser(username)} />;
  }

  return <AdminDashboard adminName={adminUser} onLogout={() => setAdminUser(null)} />;
}
