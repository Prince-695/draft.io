import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  isMobile: boolean;
  messagePanelOpen: boolean;
  // AI monthly quota — updated on page load and after each AI call
  aiRequestsUsed: number;
  aiRequestsLimit: number;
}

interface UIActions {
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleMessagePanel: () => void;
  setMessagePanelOpen: (open: boolean) => void;
  setAIUsage: (used: number, limit: number) => void;
  // Increments used count by 1 instantly after a successful AI call
  incrementAIUsage: () => void;
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
      aiRequestsUsed: 0,
      aiRequestsLimit: 10,

      // Actions
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setIsMobile: (isMobile) => set({ isMobile }),

      toggleMessagePanel: () => set((state) => ({ messagePanelOpen: !state.messagePanelOpen })),

      setMessagePanelOpen: (open) => set({ messagePanelOpen: open }),

      setAIUsage: (used, limit) => set({ aiRequestsUsed: used, aiRequestsLimit: limit }),

      incrementAIUsage: () =>
        set((state) => ({ aiRequestsUsed: Math.min(state.aiRequestsUsed + 1, state.aiRequestsLimit) })),
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
