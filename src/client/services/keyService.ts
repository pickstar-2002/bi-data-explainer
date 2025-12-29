/**
 * 密钥管理服务 - 处理API密钥的存储和获取
 */

const STORAGE_KEYS = {
  MODELSCOPE_API_KEY: 'modelscope_api_key',
  XMOV_APP_ID: 'xmov_app_id',
  XMOV_APP_SECRET: 'xmov_app_secret'
};

export interface ApiKeys {
  modelscopeApiKey: string;
  xmovAppId: string;
  xmovAppSecret: string;
}

class KeyService {
  /**
   * 从localStorage获取所有密钥
   */
  getApiKeys(): ApiKeys | null {
    try {
      const modelscopeApiKey = localStorage.getItem(STORAGE_KEYS.MODELSCOPE_API_KEY);
      const xmovAppId = localStorage.getItem(STORAGE_KEYS.XMOV_APP_ID);
      const xmovAppSecret = localStorage.getItem(STORAGE_KEYS.XMOV_APP_SECRET);

      if (!modelscopeApiKey || !xmovAppId || !xmovAppSecret) {
        return null;
      }

      return {
        modelscopeApiKey,
        xmovAppId,
        xmovAppSecret
      };
    } catch (error) {
      console.error('[KeyService] Failed to get API keys:', error);
      return null;
    }
  }

  /**
   * 保存密钥到localStorage
   */
  saveApiKeys(keys: ApiKeys): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODELSCOPE_API_KEY, keys.modelscopeApiKey);
      localStorage.setItem(STORAGE_KEYS.XMOV_APP_ID, keys.xmovAppId);
      localStorage.setItem(STORAGE_KEYS.XMOV_APP_SECRET, keys.xmovAppSecret);
      console.log('[KeyService] API keys saved successfully');
    } catch (error) {
      console.error('[KeyService] Failed to save API keys:', error);
      throw new Error('保存密钥失败');
    }
  }

  /**
   * 检查是否已配置密钥
   */
  isConfigured(): boolean {
    return this.getApiKeys() !== null;
  }

  /**
   * 清除所有密钥
   */
  clearApiKeys(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MODELSCOPE_API_KEY);
      localStorage.removeItem(STORAGE_KEYS.XMOV_APP_ID);
      localStorage.removeItem(STORAGE_KEYS.XMOV_APP_SECRET);
      console.log('[KeyService] API keys cleared');
    } catch (error) {
      console.error('[KeyService] Failed to clear API keys:', error);
    }
  }

  /**
   * 获取魔搭API密钥（用于后端请求）
   */
  getModelScopeApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.MODELSCOPE_API_KEY);
  }
}

export default new KeyService();
