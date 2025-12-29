import React, { useState } from 'react';
import { useAvatarStore } from '../../store/avatarStore';
import AvatarController from './AvatarController';

export const AvatarConnectionControl: React.FC = () => {
  const { status, errorMessage } = useAvatarStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await AvatarController.connect();
    } catch (error) {
      console.error('[ConnectionControl] Connect failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    AvatarController.disconnect();
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '已连接';
      case 'connecting': return '连接中...';
      case 'error': return '连接失败';
      default: return '未连接';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 状态指示器 */}
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
          status === 'connecting' ? 'animate-pulse' : ''
        }`} />
        <span className="text-white text-sm font-medium">
          {getStatusText()}
        </span>
      </div>

      {/* 按钮组 */}
      <div className="flex gap-2">
        {/* 连接按钮 */}
        <button
          onClick={handleConnect}
          disabled={status === 'connected' || isConnecting || status === 'connecting'}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all bg-blue-500/80 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>🔗</span>
          <span>{isConnecting || status === 'connecting' ? '连接中...' : '连接'}</span>
        </button>

        {/* 断开按钮 */}
        <button
          onClick={handleDisconnect}
          disabled={status !== 'connected'}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all bg-red-500/80 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>🔌</span>
          <span>断开</span>
        </button>
      </div>

      {/* 错误提示 */}
      {status === 'error' && errorMessage && (
        <div className="bg-red-500/80 text-white text-xs px-3 py-1 rounded-lg max-w-xs text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default AvatarConnectionControl;
