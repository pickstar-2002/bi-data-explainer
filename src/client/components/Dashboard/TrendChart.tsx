import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface TrendChartProps {
  title: string;
  data: Array<{ timestamp: number; value: number }>;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ title, data, height }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        textStyle: {
          color: '#fff',
          fontSize: 16
        },
        left: 20,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 60,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
        axisLine: {
          lineStyle: { color: 'rgba(255,255,255,0.3)' }
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: { color: 'rgba(255,255,255,0.3)' }
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.1)'
          }
        }
      },
      series: [{
        data: data.map(d => d.value),
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
            ]
          }
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'rgba(255,255,255,0.2)',
        textStyle: {
          color: '#fff'
        }
      }
    };

    chartInstance.current.setOption(option);

    // 使用 ResizeObserver 监听容器大小变化
    resizeObserverRef.current = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    resizeObserverRef.current.observe(chartRef.current);

    // 同时监听窗口大小变化
    const handleWindowResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserverRef.current?.disconnect();
      chartInstance.current?.dispose();
    };
  }, [data, title]);

  // 如果指定了固定高度，使用固定高度，否则填充父容器
  return (
    <div
      ref={chartRef}
      className="w-full h-full min-h-0"
    />
  );
};

export default TrendChart;
