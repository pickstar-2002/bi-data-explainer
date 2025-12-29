import React from 'react';

interface AlertData {
  level: 'info' | 'warning' | 'critical';
  message: string;
}

interface AlertPanelProps {
  alerts: AlertData[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>当前无预警，各项指标正常</span>
        </div>
      </div>
    );
  }

  const getAlertStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-white/70 text-sm uppercase tracking-wide">
        预警信息 ({alerts.length})
      </h4>
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`border rounded-xl px-4 py-3 ${getAlertStyle(alert.level)}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">{getAlertIcon(alert.level)}</span>
            <span className="text-sm">{alert.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel;
