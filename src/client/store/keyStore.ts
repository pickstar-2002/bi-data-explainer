import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KeyState {
  isConfigured: boolean;
  modelscopeApiKey: string | null;
  xmovAppId: string | null;
  xmovAppSecret: string | null;

  setConfigured: (configured: boolean) => void;
  setKeys: (keys: { modelscopeApiKey: string; xmovAppId: string; xmovAppSecret: string }) => void;
  clearKeys: () => void;
}

export const useKeyStore = create<KeyState>()(
  persist(
    (set) => ({
      isConfigured: false,
      modelscopeApiKey: null,
      xmovAppId: null,
      xmovAppSecret: null,

      setConfigured: (isConfigured) => set({ isConfigured }),
      setKeys: (keys) => set({ ...keys, isConfigured: true }),
      clearKeys: () => set({
        isConfigured: false,
        modelscopeApiKey: null,
        xmovAppId: null,
        xmovAppSecret: null
      })
    }),
    {
      name: 'key-storage',
      partialize: (state) => ({
        modelscopeApiKey: state.modelscopeApiKey,
        xmovAppId: state.xmovAppId,
        xmovAppSecret: state.xmovAppSecret,
        isConfigured: state.isConfigured
      })
    }
  )
);
