import keyService from '../../services/keyService';
import { useAvatarStore } from '../../store/avatarStore';

/**
 * 魔珐星云数字人SDK控制器
 * 支持手动连接和断开
 */

declare global {
  interface Window {
    XmovAvatar: any;
  }
}

export interface SpeakOptions {
  text: string;
  isStart?: boolean;
  isEnd?: boolean;
}

class AvatarController {
  private sdkInstance: any = null;
  private isConnected: boolean = false;

  /**
   * 初始化并连接SDK（从localStorage读取密钥）
   */
  async connect(): Promise<void> {
    const keys = keyService.getApiKeys();
    if (!keys) {
      throw new Error('未配置星云密钥');
    }

    const { xmovAppId, xmovAppSecret } = keys;

    // 等待SDK加载完成
    await this.waitForSDK();

    // 如果已有实例，先销毁
    if (this.sdkInstance) {
      this.sdkInstance.destroy();
    }

    useAvatarStore.getState().setStatus('connecting');

    // 创建SDK实例
    this.sdkInstance = new window.XmovAvatar({
      containerId: '#avatar-container',
      appId: xmovAppId,
      appSecret: xmovAppSecret,
      gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
      enableLogger: true,
      onMessage: (message: any) => {
        console.log('[Avatar] SDK Message:', message);
        if (message.code !== 0) {
          useAvatarStore.getState().setError(message.message || 'SDK错误');
        }
      },
      onStateChange: (state: string) => {
        console.log('[Avatar] State Change:', state);
      },
      onStatusChange: (status: any) => {
        console.log('[Avatar] Status Change:', status);
      },
      onVoiceStateChange: (voiceStatus: string) => {
        console.log('[Avatar] Voice Status:', voiceStatus);
      },
      onNetworkInfo: (networkInfo: any) => {
        console.log('[Avatar] Network Info:', networkInfo);
      }
    });

    try {
      // 初始化SDK
      await this.sdkInstance.init({
        onDownloadProgress: (progress: number) => {
          console.log(`[Avatar] Download Progress: ${progress}%`);
        },
        onError: (error: any) => {
          console.error('[Avatar] Init Error:', error);
          this.isConnected = false;
          useAvatarStore.getState().setError(error.message || '初始化失败');
        },
        onClose: () => {
          console.log('[Avatar] Connection closed');
          this.isConnected = false;
          useAvatarStore.getState().setStatus('disconnected');
        }
      });

      // 连接成功，更新状态
      this.isConnected = true;
      useAvatarStore.getState().setSdkInstance(this.sdkInstance);
      useAvatarStore.getState().setStatus('connected');
      console.log('[Avatar] Connected successfully');
    } catch (error: any) {
      console.error('[Avatar] Connect failed:', error);
      useAvatarStore.getState().setError(error.message || '连接失败');
      throw error;
    }
  }

  /**
   * 等待SDK加载
   */
  private async waitForSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkSDK = () => {
        if (window.XmovAvatar) {
          resolve();
        } else {
          setTimeout(checkSDK, 100);
        }
      };

      // 30秒超时
      setTimeout(() => reject(new Error('SDK加载超时')), 30000);
      checkSDK();
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.sdkInstance) {
      this.sdkInstance.destroy();
      this.sdkInstance = null;
    }
    this.isConnected = false;
    useAvatarStore.getState().setStatus('disconnected');
    console.log('[Avatar] Disconnected');
  }

  /**
   * 文本播报
   */
  speak(options: SpeakOptions): void {
    if (!this.sdkInstance || !this.isConnected) {
      throw new Error('数字人未连接');
    }

    const { text, isStart = true, isEnd = true } = options;

    this.sdkInstance.speak(text, isStart, isEnd);
    console.log('[Avatar] Speaking:', text);
  }

  /**
   * 切换到待机状态
   */
  idle(): void {
    if (this.sdkInstance && this.isConnected) {
      this.sdkInstance.idle();
    }
  }

  /**
   * 切换到倾听状态
   */
  listen(): void {
    if (this.sdkInstance && this.isConnected) {
      this.sdkInstance.listen();
    }
  }

  /**
   * 切换到思考状态
   */
  think(): void {
    if (this.sdkInstance && this.isConnected) {
      this.sdkInstance.think();
    }
  }

  /**
   * 切换到在线模式
   */
  onlineMode(): void {
    if (this.sdkInstance && this.isConnected) {
      this.sdkInstance.onlineMode();
    }
  }

  /**
   * 切换到离线模式
   */
  offlineMode(): void {
    if (this.sdkInstance && this.isConnected) {
      this.sdkInstance.offlineMode();
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    if (this.sdkInstance && this.isConnected) {
      this.sdkInstance.setVolume(volume);
    }
  }

  /**
   * 获取连接状态
   */
  getStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return useAvatarStore.getState().status;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.disconnect();
  }
}

export default new AvatarController();
