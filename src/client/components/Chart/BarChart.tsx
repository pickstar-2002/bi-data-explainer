import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface BarChartProps {
  title: string;
  data: Array<{ name: string; value: number; changePercent?: number }>;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, height = 300 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        textStyle: { color: '#fff', fontSize: 14 },
        left: 15,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 50,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series: [{
        data: data.map(d => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' }
            ])
          }
        })),
        type: 'bar',
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 10,
          formatter: (params: any) => {
            const value = params.value as number;
            return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : value.toLocaleString();
          }
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'rgba(255,255,255,0.2)',
        textStyle: { color: '#fff' },
        axisPointer: { type: 'shadow' }
      }
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data, title]);

  return <div ref={chartRef} style={{ height: `${height}px` }} />;
};

export default BarChart;
