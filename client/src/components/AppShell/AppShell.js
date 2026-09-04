import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationDrawer from './NotificationDrawer';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

export default function AppShell({ children, title, subtitle }) {
  const { initialize } = useAuthStore();
  const { initSocketListener } = useNotificationStore();

  useEffect(() => {
    initialize();
    initSocketListener();
  }, [initialize, initSocketListener]);

  return (
    <div className="flex min-h-screen bg-background text-slate-100 antialiased font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <NotificationDrawer />
    </div>
  );
}
