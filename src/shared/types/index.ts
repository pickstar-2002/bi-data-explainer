// 共享类型定义

export interface MetricData {
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

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  currentData?: {
    metrics?: Record<string, MetricData>;
    trends?: Record<string, TrendPoint[]>;
    alerts?: Alert[];
  };
  apiKey: string; // 魔搭API密钥，由前端传递
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
