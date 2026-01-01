import React, { useState, useEffect } from 'react';
import avatarController from '../Avatar/AvatarController';
import { useTaskStore } from '../../store/taskStore';

export interface AlertData {
  id: string;
  level: 'info' | 'warning' | 'critical';
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

interface AlertSystemProps {
  currentData?: {
    metrics?: Record<string, any>;
    alerts?: AlertData[];
  };
}

const levelConfig = {
  info: { color: 'bg-blue-500', text: 'text-blue-400', label: '信息', icon: 'ℹ️' },
  warning: { color: 'bg-yellow-500', text: 'text-yellow-400', label: '警告', icon: '⚠️' },
  critical: { color: 'bg-red-500', text: 'text-red-400', label: '严重', icon: '🚨' }
};

export const AlertSystem: React.FC<AlertSystemProps> = ({ currentData }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);
  const addTask = useTaskStore((state) => state.addTask);

  // 检测数据异常并生成报警
  useEffect(() => {
    if (!currentData?.metrics) return;

    const newAlerts: AlertData[] = [];
    const now = Date.now();

    // 避免重复报警（5分钟内相同指标不重复报警）
    const shouldAlert = (metricName: string) => {
      const recentAlert = alerts.find(
        a => a.metric === metricName && now - a.timestamp < 300000
      );
      return !recentAlert;
    };

    // 营业收入异常检测
    const revenue = currentData.metrics['营业收入'];
    if (revenue && shouldAlert('营业收入')) {
      if (revenue.changePercent < -20) {
        newAlerts.push({
          id: `alert-${now}-revenue`,
          level: 'critical',
          metric: '营业收入',
          message: `营业收入大幅下降${Math.abs(revenue.changePercent).toFixed(2)}%，需要立即关注！`,
          value: revenue.changePercent,
          threshold: -20,
          timestamp: now,
          acknowledged: false
        });
      } else if (revenue.changePercent < -10) {
        newAlerts.push({
          id: `alert-${now}-revenue`,
          level: 'warning',
          metric: '营业收入',
          message: `营业收入下降${Math.abs(revenue.changePercent).toFixed(2)}%，建议关注`,
          value: revenue.changePercent,
          threshold: -10,
          timestamp: now,
          acknowledged: false
        });
      } else if (revenue.changePercent > 30) {
        newAlerts.push({
          id: `alert-${now}-revenue`,
          level: 'info',
          metric: '营业收入',
          message: `营业收入增长${revenue.changePercent.toFixed(2)}%，表现优异！`,
          value: revenue.changePercent,
          threshold: 30,
          timestamp: now,
          acknowledged: false
        });
      }
    }

    // 毛利率异常检测
    const margin = currentData.metrics['毛利率'];
    if (margin && shouldAlert('毛利率')) {
      if (margin.value < 20) {
        newAlerts.push({
          id: `alert-${now}-margin`,
          level: 'critical',
          metric: '毛利率',
          message: `毛利率过低(${margin.value.toFixed(2)}%)，盈利能力严重不足！`,
          value: margin.value,
          threshold: 20,
          timestamp: now,
          acknowledged: false
        });
      } else if (margin.value < 30) {
        newAlerts.push({
          id: `alert-${now}-margin`,
          level: 'warning',
          metric: '毛利率',
          message: `毛利率偏低(${margin.value.toFixed(2)}%)，建议优化成本结构`,
          value: margin.value,
          threshold: 30,
          timestamp: now,
          acknowledged: false
        });
      }
    }

    // 转化率异常检测
    const conversion = currentData.metrics['转化率'];
    if (conversion && shouldAlert('转化率')) {
      if (conversion.changePercent < -15) {
        newAlerts.push({
          id: `alert-${now}-conversion`,
          level: 'warning',
          metric: '转化率',
          message: `转化率下降${Math.abs(conversion.changePercent).toFixed(2)}%，需要检查营销漏斗`,
          value: conversion.changePercent,
          threshold: -15,
          timestamp: now,
          acknowledged: false
        });
      }
    }

    // 活跃用户异常检测
    const activeUsers = currentData.metrics['活跃用户'];
    if (activeUsers && shouldAlert('活跃用户')) {
      if (activeUsers.changePercent < -25) {
        newAlerts.push({
          id: `alert-${now}-users`,
          level: 'critical',
          metric: '活跃用户',
          message: `活跃用户大幅下降${Math.abs(activeUsers.changePercent).toFixed(2)}%，用户流失严重！`,
          value: activeUsers.changePercent,
          threshold: -25,
          timestamp: now,
          acknowledged: false
        });
      }
    }

    // 订单量异常检测
    const orders = currentData.metrics['订单量'];
    if (orders && shouldAlert('订单量')) {
      if (orders.changePercent > 50) {
        newAlerts.push({
          id: `alert-${now}-orders`,
          level: 'info',
          metric: '订单量',
          message: `订单量激增${orders.changePercent.toFixed(2)}%，可能需要扩容处理能力`,
          value: orders.changePercent,
          threshold: 50,
          timestamp: now,
          acknowledged: false
        });
      } else if (orders.changePercent < -30) {
        newAlerts.push({
          id: `alert-${now}-orders`,
          level: 'critical',
          metric: '订单量',
          message: `订单量大幅下降${Math.abs(orders.changePercent).toFixed(2)}%，需要立即调查原因！`,
          value: orders.changePercent,
          threshold: -30,
          timestamp: now,
          acknowledged: false
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      setLastAlertTime(now);

      // 数字人播报严重和警告级别的报警
      const importantAlerts = newAlerts.filter(a => a.level === 'critical' || a.level === 'warning');
      if (importantAlerts.length > 0) {
        const alertText = importantAlerts.map(a => a.message).join('；');
        try {
          avatarController.think(); // 切换到思考状态
          setTimeout(() => {
            avatarController.speak({
              text: `检测到异常：${alertText}`,
              isStart: true,
              isEnd: true
            });
          }, 500);
        } catch (e) {
          console.log('Avatar speak failed:', e);
        }
      }
    }
  }, [currentData]);

  // 确认报警
  const acknowledgeAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  // 删除报警
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // 从报警创建任务
  const createTaskFromAlert = (alert: AlertData) => {
    const priority = alert.level === 'critical' ? 'urgent' : alert.level === 'warning' ? 'high' : 'medium';

    addTask({
      title: `处理${alert.metric}异常`,
      description: alert.message,
      category: 'investigation',
      priority,
      relatedMetric: alert.metric
    });

    acknowledgeAlert(alert.id);

    // 数字人播报
    try {
      avatarController.speak({
        text: `已创建任务来处理${alert.metric}异常`,
        isStart: true,
        isEnd: true
      });
    } catch (e) {
      console.log('Avatar speak failed:', e);
    }
  };

  // 批量确认所有报警
  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  // 未确认的报警
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter(a => a.level === 'critical').length;
  const warningCount = unacknowledgedAlerts.filter(a => a.level === 'warning').length;

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span>🔔</span>
            <span>异常报警</span>
          </h3>
          {(criticalCount > 0 || warningCount > 0) && (
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  {criticalCount} 严重
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {warningCount} 警告
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unacknowledgedAlerts.length > 0 && (
            <button
              onClick={acknowledgeAll}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition"
            >
              全部确认
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/60 hover:text-white text-xs transition"
          >
            {showHistory ? '隐藏历史' : '查看历史'}
          </button>
        </div>
      </div>

      {/* 报警列表 */}
      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50 py-8">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-sm font-medium">系统运行正常</p>
            <p className="text-xs mt-1">暂无异常报警</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {alerts.map((alert) => {
              const config = levelConfig[alert.level];
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-l-4 transition ${
                    alert.acknowledged
                      ? 'bg-white/5 border-white/20 opacity-60'
                      : alert.level === 'critical'
                      ? 'bg-red-500/10 border-red-500'
                      : alert.level === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500'
                      : 'bg-blue-500/10 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className={`text-xs font-medium ${config.text}`}>
                          {config.label}
                        </span>
                        <span className="text-white/60 text-xs">
                          {alert.metric}
                        </span>
                        {!alert.acknowledged && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">
                            未确认
                          </span>
                        )}
                      </div>
                      <p className="text-white/90 text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>
                          当前值: <span className={config.text}>{alert.value.toFixed(2)}</span>
                        </span>
                        <span>阈值: {alert.threshold}</span>
                        <span>
                          {new Date(alert.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 mt-3">
                    {!alert.acknowledged && (
                      <>
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => createTaskFromAlert(alert)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition"
                        >
                          创建任务
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-3 py-1 bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-red-400 rounded-lg text-xs transition"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 报警统计 */}
      {alerts.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center justify-around text-xs">
            <div className="text-center">
              <div className="text-white font-bold">{alerts.length}</div>
              <div className="text-white/60">总计</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold">{alerts.filter(a => a.level === 'critical').length}</div>
              <div className="text-white/60">严重</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">{alerts.filter(a => a.level === 'warning').length}</div>
              <div className="text-white/60">警告</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{alerts.filter(a => a.level === 'info').length}</div>
              <div className="text-white/60">信息</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
