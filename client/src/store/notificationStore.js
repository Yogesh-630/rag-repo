import { create } from 'zustand';
import { getSocket } from '../services/socket';

export const useNotificationStore = create((set, get) => ({
  notifications: [
    {
      id: 'notif_welcome',
      type: 'info',
      title: 'CollegeRAG_AI Active',
      message: 'Institutional RAG knowledge base loaded and ready for queries.',
      timestamp: new Date().toLocaleTimeString(),
      isRead: false,
    },
  ],
  isOpen: false,

  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () => set({ isOpen: false }),

  addNotification: (notif) => {
    const newNotif = {
      id: 'notif_' + Date.now(),
      type: notif.type || 'info',
      title: notif.title || 'System Alert',
      message: notif.message,
      timestamp: new Date().toLocaleTimeString(),
      isRead: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  initSocketListener: () => {
    const socket = getSocket();
    if (socket) {
      socket.on('notification', (data) => {
        get().addNotification(data);
      });
      socket.on('doc_progress', (data) => {
        if (data.status === 'indexed') {
          get().addNotification({
            type: 'success',
            title: 'Indexing Complete',
            message: data.message,
          });
        }
      });
    }
  },
}));
