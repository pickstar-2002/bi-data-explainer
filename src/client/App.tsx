import React, { useEffect, useState, useRef } from 'react';
import { ApiKeyConfig } from './components/Config/ApiKeyConfig';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { AvatarContainer } from './components/Avatar/AvatarContainer';
import { MetricCard } from './components/Dashboard/MetricCard';
import { TrendChart, BarChart, PieChart, GaugeChart } from './components/Chart';
import { ScenarioSwitcher } from './components/Data/ScenarioSwitcher';
import { RegionalChart } from './components/Dashboard/RegionalChart';
import { ProductChart } from './components/Dashboard/ProductChart';
import { ChatBox } from './components/Chat/ChatBox';
import { TaskPanel } from './components/Dashboard/TaskPanel';
import { AlertSystem } from './components/Dashboard/AlertSystem';
import keyService from './services/keyService';
import dataService from './services/dataService';
import { useKeyStore } from './store/keyStore';
import { useAvatarStore } from './store/avatarStore';
import AvatarController from './components/Avatar/AvatarController';
import type { AIGeneratedData } from './services/dataService';

type ViewMode = 'overview' | 'regional' | 'product' | 'chat' | 'tasks' | 'alerts';

function App() {
  const { isConfigured, setConfigured, setKeys } = useKeyStore();
  const { status } = useAvatarStore();
  const [isLoading, setIsLoading] = useState(true);

  // AI数据相关状态
  const [currentScenario, setCurrentScenario] = useState<string>('normal');
  const [aiData, setAiData] = useState<AIGeneratedData | null>(null);
  const [previousData, setPreviousData] = useState<AIGeneratedData | null>(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [dataError, setDataError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | undefined>(undefined);

  const lastDataRef = useRef<AIGeneratedData | null>(null);

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

  // 数字人播报
  const handleAvatarSpeak = (text: string) => {
    if (status === 'connected') {
      try {
        AvatarController.speak({ text });
      } catch (error) {
        console.error('[Avatar] Speak error:', error);
      }
    }
  };

  // 生成播报内容
  const generateBroadcastContent = (): string => {
    if (!aiData || !aiData.metrics) return '暂无数据可播报';

    const metrics = aiData.metrics;
    const revenue = metrics.find(m => m.name === '营业收入');
    const margin = metrics.find(m => m.name === '毛利率');
    const users = metrics.find(m => m.name === '活跃用户');
    const orders = metrics.find(m => m.name === '订单量');

    let content = '现在为您播报本次业务数据概况。';

    // 核心指标播报
    if (revenue) {
      const revenueWan = (revenue.value / 10000).toFixed(0);
      const trend = revenue.changePercent > 0 ? '增长' : revenue.changePercent < 0 ? '下降' : '持平';
      content += `营业收入为${revenueWan}万元，较上期${trend}${Math.abs(revenue.changePercent).toFixed(2)}%。`;
    }

    if (margin) {
      const mtrend = margin.changePercent > 0 ? '上升' : margin.changePercent < 0 ? '下降' : '持平';
      content += `毛利率为${margin.value.toFixed(2)}%，较上期${mtrend}${Math.abs(margin.changePercent).toFixed(2)}个百分点。`;
    }

    if (users) {
      const utrend = users.changePercent > 0 ? '增长' : users.changePercent < 0 ? '下降' : '持平';
      content += `活跃用户数为${users.value.toLocaleString()}人，较上期${utrend}${Math.abs(users.changePercent).toFixed(2)}%。`;
    }

    if (orders) {
      const otrend = orders.changePercent > 0 ? '增长' : orders.changePercent < 0 ? '下降' : '持平';
      content += `订单量为${orders.value.toLocaleString()}单，较上期${otrend}${Math.abs(orders.changePercent).toFixed(2)}%。`;
    }

    // 预警播报
    if (aiData.alerts && aiData.alerts.length > 0) {
      content += `需要注意的是，`;
      aiData.alerts.slice(0, 2).forEach((alert, index) => {
        content += alert.message;
        if (index < Math.min(aiData.alerts.length, 2) - 1) {
          content += '；';
        }
      });
      content += '。';
    }

    // 整体趋势
    if (aiData.insight) {
      content += aiData.insight;
    }

    // 业务建议（简短）
    if (aiData.suggestion) {
      const shortSuggestion = aiData.suggestion.split('。')[0] + '。';
      content += shortSuggestion;
    }

    content += '播报完毕。';

    return content;
  };

  // 手动播报
  const handleBroadcast = () => {
    if (isSpeaking) return;

    const content = generateBroadcastContent();
    setIsSpeaking(true);
    handleAvatarSpeak(content);

    // 模拟播报结束（实际应该从SDK获取播报状态）
    setTimeout(() => {
      setIsSpeaking(false);
    }, 30000);
  };

  // 生成数据并播报
  const generateData = async (scenario: string, speak: boolean = true) => {
    setIsGeneratingData(true);
    setDataError('');

    try {
      const data = await dataService.generateData({
        scenario: scenario as any,
        useAI: true, // 使用AI生成数据
        previousData: previousData ? { metrics: previousData.metrics } : undefined
      });

      setAiData(data);
      setLastUpdateTime(Date.now());

      // 保存为上期数据
      if (lastDataRef.current) {
        setPreviousData(lastDataRef.current);
      }
      lastDataRef.current = data;

      // 自动播报数据摘要
      if (speak && data.insight) {
        setTimeout(() => {
          handleAvatarSpeak(`数据更新完毕。${data.insight}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error('[App] Generate data error:', error);
      setDataError(error.message || '数据生成失败');
    } finally {
      setIsGeneratingData(false);
    }
  };

  const handleScenarioChange = (scenario: string) => {
    setCurrentScenario(scenario);
    generateData(scenario, true);
  };

  useEffect(() => {
    if (isConfigured) {
      generateData('normal', false);
    }
  }, [isConfigured]);

  useEffect(() => {
    const keys = keyService.getApiKeys();
    if (keys) {
      setKeys(keys);
      setConfigured(true);
    }
    setIsLoading(false);
  }, [setKeys, setConfigured]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!isConfigured) {
    return <ApiKeyConfig onConfigured={() => setConfigured(true)} />;
  }

  const iconMap: Record<string, string> = {
    '营业收入': '💰', '订单量': '📦', '毛利率': '📈',
    '活跃用户': '👥', '转化率': '🎯', '客单价': '💎', '复购率': '🔄'
  };

  // 计算目标完成度（用于仪表盘）
  const calculateTargetCompletion = () => {
    if (!aiData?.metrics) return 50;
    const revenue = aiData.metrics.find(m => m.name === '营业收入');
    if (!revenue) return 50;
    // 假设目标是600万
    return Math.min((revenue.value / 6000000) * 100, 100);
  };

  return (
    <DashboardLayout lastUpdateTime={lastUpdateTime}>
      {/* AI讲解员 - 固定在屏幕中央20%位置 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[20vw] min-w-[300px] min-h-[300px] z-50 pointer-events-none">
        <div className="relative w-full h-full">
          {/* 半透明背景圆 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm border-2 border-white/30 shadow-2xl"></div>

          {/* 数字人容器 */}
          <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-auto">
            <AvatarContainer />
          </div>

          {/* 状态指示器 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-1 rounded-full border border-white/20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
              <span className="text-white text-xs font-medium">{getStatusText()}</span>
              <span className="text-white/40 text-xs">|</span>
              <span className="text-white/70 text-xs">AI讲解员</span>
            </div>
          </div>

          {/* 连接控制按钮 */}
          <div className="absolute -top-3 right-0 pointer-events-auto">
            <button
              onClick={() => AvatarController.disconnect()}
              className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 rounded-full text-xs border border-white/30 backdrop-blur-sm transition"
            >
              断开
            </button>
          </div>

          {/* 播报按钮 */}
          {status === 'connected' && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
              <button
                onClick={handleBroadcast}
                disabled={isSpeaking || !aiData}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium border border-white/30 backdrop-blur-sm transition-all shadow-lg ${
                  isSpeaking
                    ? 'bg-gray-500/80 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                }`}
              >
                <span className={isSpeaking ? 'animate-pulse' : ''}>{isSpeaking ? '🔊' : '📢'}</span>
                <span>{isSpeaking ? '播报中...' : '开始播报'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-full flex flex-col gap-3">
        {/* 顶部栏 */}
        <div className="flex gap-3 flex-shrink-0">
          {/* 左侧：场景切换 */}
          <div className="flex-1">
            <ScenarioSwitcher
              onScenarioChange={handleScenarioChange}
              currentScenario={currentScenario}
              isGeneratingData={isGeneratingData}
            />
          </div>

          {/* 右侧：视图切换 */}
          <div className="flex gap-2">
            {(['overview', 'regional', 'product', 'chat', 'tasks', 'alerts'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {mode === 'overview' ? '📊 总览' : ''}
                {mode === 'regional' ? '🌍 地区' : ''}
                {mode === 'product' ? '📦 产品' : ''}
                {mode === 'chat' ? '💬 对话' : ''}
                {mode === 'tasks' ? '📋 任务' : ''}
                {mode === 'alerts' ? '🔔 报警' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 7个指标卡片 */}
        <div className="grid grid-cols-7 gap-3 flex-shrink-0">
          {aiData?.metrics.slice(0, 7).map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.name}
              value={metric.value}
              unit={metric.unit}
              change={metric.change}
              changePercent={metric.changePercent}
              icon={iconMap[metric.name] || '📊'}
            />
          )) || <div className="col-span-7 text-white/60 text-center py-6">加载中...</div>}
        </div>

        {/* 主内容区 */}
        <div className="flex-1 min-h-0">
          {viewMode === 'overview' && (
            <div className="grid grid-cols-3 gap-3 h-full">
              {/* 趋势图 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                <TrendChart title="营业收入趋势（12小时）" data={aiData?.trend || []} height={240} />
              </div>

              {/* 地区分布 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 overflow-hidden flex flex-col">
                {aiData?.regionalData ? <RegionalChart data={aiData.regionalData} /> : <div className="text-white/60 text-center py-8">加载中...</div>}
              </div>

              {/* 产品分类 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 overflow-hidden flex flex-col">
                {aiData?.productData ? <ProductChart data={aiData.productData} /> : <div className="text-white/60 text-center py-8">加载中...</div>}
              </div>

              {/* AI洞察面板 */}
              <div className="col-span-3 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <span>🤖</span><span>AI 洞察</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {aiData?.insight && (
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-white/90 text-sm leading-relaxed">{aiData.insight}</p>
                    </div>
                  )}
                  {aiData?.suggestion && (
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{aiData.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'regional' && (
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <BarChart title="各地区营收对比" data={aiData?.regionalData?.map(d => ({ name: d.name, value: d.value })) || []} height={300} />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <PieChart title="各地区营收占比" data={aiData?.regionalData?.map(d => ({ name: d.name, value: d.value })) || []} height={300} />
              </div>
            </div>
          )}

          {viewMode === 'product' && (
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <BarChart title="各品类营收对比" data={aiData?.productData?.map(d => ({ name: d.name, value: d.revenue })) || []} height={300} />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <PieChart title="各品类营收占比" data={aiData?.productData?.map(d => ({ name: d.name, value: d.revenue })) || []} height={300} />
              </div>
            </div>
          )}

          {viewMode === 'chat' && (
            <div className="h-full">
              <ChatBox currentData={aiData} onSpeak={handleAvatarSpeak} />
            </div>
          )}

          {viewMode === 'tasks' && (
            <div className="h-full">
              <TaskPanel currentData={aiData} />
            </div>
          )}

          {viewMode === 'alerts' && (
            <div className="h-full">
              <AlertSystem currentData={aiData} />
            </div>
          )}
        </div>

        {/* 底部：目标完成度仪表盘 */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-3 gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
              <GaugeChart title="营收目标完成度" value={calculateTargetCompletion()} max={100} unit="%" height={160} />
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 col-span-2">
              <BarChart
                title="各地区增长率"
                data={aiData?.regionalData?.map(d => ({ name: d.name, value: d.changePercent })) || []}
                height={160}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default App;
