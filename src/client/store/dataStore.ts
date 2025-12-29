import { create } from 'zustand';

export interface Metric {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  timestamp: number;
}

export interface TrendPoint {
  timestamp: number;
  value: number;
}

interface DataState {
  metrics: Record<string, Metric>;
  trends: Record<string, TrendPoint[]>;
  alerts: any[];
  isLoading: boolean;
  lastUpdateTime: number;

  setMetrics: (metrics: Record<string, Metric>) => void;
  setTrends: (trends: Record<string, TrendPoint[]>) => void;
  setAlerts: (alerts: any[]) => void;
  setLoading: (loading: boolean) => void;
  updateLastUpdateTime: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  metrics: {},
  trends: {},
  alerts: [],
  isLoading: false,
  lastUpdateTime: 0,

  setMetrics: (metrics) => set({ metrics }),
  setTrends: (trends) => set({ trends }),
  setAlerts: (alerts) => set({ alerts }),
  setLoading: (isLoading) => set({ isLoading }),
  updateLastUpdateTime: () => set({ lastUpdateTime: Date.now() })
}));
