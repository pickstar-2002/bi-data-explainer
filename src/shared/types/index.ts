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

// 任务相关类型
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskCategory = 'data_analysis' | 'optimization' | 'investigation' | 'report' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  completedAt?: number;
  relatedMetric?: string;
  notes?: string;
}

export interface TaskCreateInput {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: number;
  relatedMetric?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee?: string;
  dueDate?: number;
  notes?: string;
}
