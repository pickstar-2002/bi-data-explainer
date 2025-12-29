import React from 'react';

interface RegionalData {
  name: string;
  value: number;
  changePercent: number;
}

interface RegionalChartProps {
  data: RegionalData[];
}

export const RegionalChart: React.FC<RegionalChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const getBarColor = (changePercent: number) => {
    if (changePercent > 10) return 'bg-green-500';
    if (changePercent > 0) return 'bg-green-400';
    if (changePercent > -10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getChangeIcon = (changePercent: number) => {
    if (changePercent > 0) return '↑';
    if (changePercent < 0) return '↓';
    return '→';
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🌍</span>
        <span>地区分布</span>
      </h3>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {data.map((region, index) => (
          <div key={index} className="bg-black/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">{region.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  region.changePercent > 0 ? 'text-green-400' :
                  region.changePercent < 0 ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {getChangeIcon(region.changePercent)} {Math.abs(region.changePercent).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 营收额 */}
            <div className="text-white/90 text-sm mb-2">
              ¥{(region.value / 10000).toFixed(0)}万
            </div>

            {/* 进度条 */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getBarColor(region.changePercent)} transition-all duration-500`}
                style={{ width: `${(region.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalChart;
