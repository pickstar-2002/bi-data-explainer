// 共享常量定义

export const API_ROUTES = {
  CHAT_STREAM: '/api/chat/stream',
  DATA_OVERVIEW: '/api/data/overview',
  ALERTS: '/api/alerts',
  HEALTH: '/health'
} as const;

export const STORAGE_KEYS = {
  MODELSCOPE_API_KEY: 'modelscope_api_key',
  XMOV_APP_ID: 'xmov_app_id',
  XMOV_APP_SECRET: 'xmov_app_secret'
} as const;

export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
} as const;

export const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
} as const;
