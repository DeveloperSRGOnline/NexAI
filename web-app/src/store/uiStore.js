import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const getStoredMode = () => {
  try {
    const saved = localStorage.getItem('nexai-sidebar-mode');
    if (['general', 'developer', 'student', 'power-user'].includes(saved)) {
      return saved;
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
  return 'general';
};

const useUiStore = create(
  devtools(
    (set) => ({
      sidebarOpen: false, // Mobile drawer starts closed
      sidebarCollapsed: false, // Desktop rail mode starts expanded
      sidebarMode: getStoredMode(), // general | developer | student | power-user
      activeModal: null,
      theme: 'dark',

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMode: (sidebarMode) => {
        try {
          localStorage.setItem('nexai-sidebar-mode', sidebarMode);
        } catch (e) {}
        set({ sidebarMode });
      },
      setActiveModal: (activeModal) => set({ activeModal }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-store' }
  )
);

export default useUiStore;
