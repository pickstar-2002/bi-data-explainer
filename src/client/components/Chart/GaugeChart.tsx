import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface GaugeChartProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  thresholds?: Array<{ value: number; color: string; label: string }>;
  height?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  max,
  unit = '%',
  thresholds = [
    { value: 30, color: '#ef4444', label: '差' },
    { value: 60, color: '#f59e0b', label: '中' },
    { value: 80, color: '#22c55e', label: '良' },
    { value: 100, color: '#3b82f6', label: '优' }
  ],
  height = 250
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    // 计算当前值的等级
    const getCurrentLevel = () => {
      for (const t of thresholds) {
        if (value <= t.value) return t.label;
      }
      return thresholds[thresholds.length - 1].label;
    };

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        textStyle: { color: '#fff', fontSize: 14 },
        left: 15,
        top: 10
      },
      series: [{
        type: 'gauge',
        center: ['50%', '65%'],
        radius: '75%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: max,
        splitNumber: 10,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: thresholds[0].color },
            { offset: 0.3, color: thresholds[1]?.color || thresholds[0].color },
            { offset: 0.6, color: thresholds[2]?.color || thresholds[1]?.color || thresholds[0].color },
            { offset: 1, color: thresholds[3]?.color || thresholds[2]?.color || thresholds[1]?.color || thresholds[0].color }
          ])
        },
        progress: {
          show: true,
          width: 12
        },
        pointer: {
          show: true,
          length: '60%',
          width: 4,
          itemStyle: { color: '#fff' }
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: thresholds.map(t => [t.value / max, t.color])
          }
        },
        axisTick: {
          distance: -20,
          length: 5,
          lineStyle: { color: '#fff', width: 1 }
        },
        splitLine: {
          distance: -25,
          length: 10,
          lineStyle: { color: '#fff', width: 2 }
        },
        axisLabel: {
          distance: -35,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10,
          formatter: (v: number) => `${(v / max * 100).toFixed(2)}`
        },
        detail: {
          valueAnimation: true,
          formatter: (v: number) => `${v.toFixed(2)}${unit}`,
          color: '#fff',
          fontSize: 20,
          offsetCenter: [0, '0%']
        },
        title: {
          offsetCenter: [0, '80%'],
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)'
        },
        data: [{ value, name: getCurrentLevel() }]
      }],
      tooltip: {
        formatter: `{a} <br/>{title}: {c}${unit}`
      }
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [value, max, title, thresholds, unit]);

  return <div ref={chartRef} style={{ height: `${height}px` }} />;
};

export default GaugeChart;
