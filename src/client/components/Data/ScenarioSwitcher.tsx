import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

export interface Scenario {
  value: string;
  label: string;
  description: string;
}

interface ScenarioSwitcherProps {
  onScenarioChange: (scenario: string) => void;
  currentScenario: string;
  isGeneratingData?: boolean;
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  onScenarioChange,
  currentScenario,
  isGeneratingData = false
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadScenarios();
  }, []);

  // 进度条逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentProgress = 0;

    if (isGeneratingData) {
      // 重置进度
      setProgress(0);
      currentProgress = 0;

      // 每100ms增加0.25%，40秒完成
      interval = setInterval(() => {
        currentProgress += 0.25;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          clearInterval(interval);
        } else {
          setProgress(currentProgress);
        }
      }, 100);
    } else {
      // 重置进度
      setProgress(0);
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGeneratingData]);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const data = await dataService.getScenarios();
      setScenarios(data);
    } catch (error) {
      console.error('[ScenarioSwitcher] Load scenarios error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScenarioIcon = (value: string) => {
    switch (value) {
      case 'normal': return '📊';
      case 'promotion': return '🎉';
      case 'off_season': return '📉';
      case 'anomaly': return '⚠️';
      case 'custom': return '⚙️';
      default: return '📊';
    }
  };

  const getScenarioColor = (value: string) => {
    switch (value) {
      case 'normal': return 'from-blue-500 to-purple-500';
      case 'promotion': return 'from-green-500 to-emerald-500';
      case 'off_season': return 'from-yellow-500 to-orange-500';
      case 'anomaly': return 'from-red-500 to-pink-500';
      case 'custom': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎬</span>
        <span>场景切换</span>
        {isGeneratingData && (
          <span className="ml-2 flex items-center gap-2 text-sm font-normal text-blue-300">
            <span className="animate-spin">⏳</span>
            <span>正在生成数据...</span>
            <span className="text-white/60">({progress.toFixed(0)}%)</span>
          </span>
        )}
      </h3>

      {/* 进度条 */}
      {isGeneratingData && (
        <div className="mb-4">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/50">
            <span>AI分析中...</span>
            <span>预计剩余{Math.max(0, 40 - (progress / 2.5)).toFixed(0)}秒</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-white/60 text-sm">加载中...</div>
      ) : (
        <div className={`grid grid-cols-5 gap-3 ${isGeneratingData ? 'opacity-50 pointer-events-none' : ''}`}>
          {scenarios.map((scenario) => (
            <button
              key={scenario.value}
              onClick={() => !isGeneratingData && onScenarioChange(scenario.value)}
              className={`
                relative px-4 py-3 rounded-xl font-medium transition-all
                ${currentScenario === scenario.value
                  ? `bg-gradient-to-r ${getScenarioColor(scenario.value)} text-white shadow-lg scale-105`
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }
                ${isGeneratingData ? 'cursor-not-allowed' : ''}
              `}
            >
              <div className="text-2xl mb-1">{getScenarioIcon(scenario.value)}</div>
              <div className="text-sm font-medium">{scenario.label}</div>
              {currentScenario === scenario.value && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow"></div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-black/30 rounded-xl">
        <p className="text-white/70 text-sm">
          {isGeneratingData
            ? 'AI正在根据场景生成业务数据，请稍候...'
            : scenarios.find(s => s.value === currentScenario)?.description || '选择一个场景切换数据展示'
          }
        </p>
      </div>
    </div>
  );
};

export default ScenarioSwitcher;
