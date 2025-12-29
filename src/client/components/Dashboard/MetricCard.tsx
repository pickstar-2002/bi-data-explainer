import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changePercent,
  icon = '📊',
  trend
}) => {
  const getTrendColor = () => {
    if (changePercent > 0) return 'text-green-400';
    if (changePercent < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (changePercent > 0) return '↑';
    if (changePercent < 0) return '↓';
    return '→';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-300 text-sm mb-1">{title}</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white">{value.toLocaleString()}</span>
            <span className="text-lg text-gray-400 ml-2">{unit}</span>
          </div>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>

      <div className={`flex items-center ${getTrendColor()}`}>
        <span className="text-xl mr-1">{getTrendIcon()}</span>
        <span className="text-sm">
          {changePercent > 0 ? '增长' : changePercent < 0 ? '下降' : '持平'} {Math.abs(changePercent).toFixed(2)}%
        </span>
        <span className="text-gray-400 text-xs ml-2">
          (较上期{change > 0 ? '+' : ''}{change.toLocaleString()})
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
