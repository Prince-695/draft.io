import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  isMobile: boolean;
  messagePanelOpen: boolean;
}

interface UIActions {
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleMessagePanel: () => void;
  setMessagePanelOpen: (open: boolean) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: true,
      isMobile: false,
      messagePanelOpen: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setIsMobile: (isMobile) => set({ isMobile }),

      toggleMessagePanel: () => set((state) => ({ messagePanelOpen: !state.messagePanelOpen })),

      setMessagePanelOpen: (open) => set({ messagePanelOpen: open }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
