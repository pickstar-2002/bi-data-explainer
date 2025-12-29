import React, { useRef, useEffect, useState } from 'react';
import { useAvatarStore } from '../../store/avatarStore';
import AvatarController from './AvatarController';

export const AvatarContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { status, errorMessage } = useAvatarStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await AvatarController.connect();
    } catch (error) {
      console.error('[AvatarContainer] Connect failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      AvatarController.dispose();
    };
  }, []);

  return (
    <div className="relative h-full">
      {/* 数字人渲染容器 */}
      <div className="relative h-full">
        <div
          id="avatar-container"
          ref={containerRef}
          className="w-full h-full bg-black/20 rounded-2xl overflow-hidden"
        />

        {/* 中间连接按钮（仅在未连接时显示） */}
        {status === 'disconnected' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all bg-blue-500/80 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-xl"
            >
              <span>{isConnecting ? '⏳' : '🔗'}</span>
              <span>{isConnecting ? '连接中...' : '连接数字人'}</span>
            </button>
          </div>
        )}

        {/* 连接中状态 */}
        {status === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
            <div className="text-center text-white">
              <div className="animate-spin text-5xl mb-3">⚙️</div>
              <p className="text-lg">正在连接数字人...</p>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <p className="text-red-400 text-lg mb-4">连接失败</p>
              {errorMessage && (
                <p className="text-white text-sm mb-4">{errorMessage}</p>
              )}
              <button
                onClick={handleConnect}
                className="px-6 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full text-sm"
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarContainer;
