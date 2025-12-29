import React, { ReactNode } from 'react';
import { useScale } from '../../hooks/useScale';

interface DashboardLayoutProps {
  children: ReactNode;
  lastUpdateTime?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, lastUpdateTime }) => {
  const scale = useScale();

  // 格式化最后更新时间
  const formatLastUpdateTime = (timestamp?: number) => {
    if (!timestamp) return '--:--:--';
    return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });
  };

  // 更新时间
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeEl = document.getElementById('current-time');

      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 h-screen w-screen overflow-hidden flex flex-col"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`
      }}
    >
      {/* 顶部标题栏 */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">📊 企业运营数据大屏</h1>
          <p className="text-sm opacity-80">实时数据监控与智能讲解</p>
        </div>

        <div className="text-right space-y-1">
          <div className="text-2xl font-bold" id="current-time">00:00:00</div>
          <div className="text-xs opacity-80 space-x-3">
            <span>数据最后更新: <span>{formatLastUpdateTime(lastUpdateTime)}</span></span>
            <span>系统状态: <span className="text-green-400">运行中</span></span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 p-6 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
