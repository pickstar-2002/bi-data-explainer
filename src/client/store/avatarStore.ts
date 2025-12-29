import { create } from 'zustand';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface AvatarState {
  // 连接状态
  status: ConnectionStatus;
  errorMessage: string;

  // SDK实例
  sdkInstance: any;

  // 动作
  setStatus: (status: ConnectionStatus) => void;
  setError: (message: string) => void;
  setSdkInstance: (instance: any) => void;

  // 连接控制
  disconnect: () => void;
}

export const useAvatarStore = create<AvatarState>()((set) => ({
  status: 'disconnected',
  errorMessage: '',
  sdkInstance: null,

  setStatus: (status) => set({ status, errorMessage: '' }),
  setError: (errorMessage) => set({ status: 'error', errorMessage }),
  setSdkInstance: (sdkInstance) => set({ sdkInstance }),

  disconnect: () => {
    set({
      status: 'disconnected',
      sdkInstance: null,
      errorMessage: ''
    });
  }
}));
