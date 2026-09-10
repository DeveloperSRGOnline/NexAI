import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useUiStore = create(
  devtools(
    (set) => ({
      sidebarOpen: true,
      sidebarMode: 'general', // general | developer | student | power
      activeModal: null,
      theme: 'dark',

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarMode: (sidebarMode) => set({ sidebarMode }),
      setActiveModal: (activeModal) => set({ activeModal }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-store' }
  )
);

export default useUiStore;
