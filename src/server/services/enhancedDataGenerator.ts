import fs from 'fs';
import path from 'path';
import type { ScenarioType } from './aiDataGenerator';

/**
 * 扩展的指标数据
 */
export interface ExtendedMetric {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

/**
 * 地区数据
 */
export interface RegionalData {
  name: string;
  value: number;
  changePercent: number;
}

/**
 * 产品分类数据
 */
export interface ProductCategoryData {
  name: string;
  revenue: number;
  margin: number;
  share: number;
}

/**
 * 扩展的生成数据
 */
export interface ExtendedGeneratedData {
  metrics: ExtendedMetric[];
  trend: Array<{ timestamp: number; value: number }>;
  regionalData: RegionalData[];
  productData: ProductCategoryData[];
  insight: string;
  suggestion: string;
  alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
  }>;
}

/**
 * 业务数据配置
 */
interface BusinessDataConfig {
  scenarios: {
    [key: string]: {
      name: string;
      description: string;
      baseMetrics: {
        [key: string]: {
          value: number;
          unit: string;
          volatility: number;
        };
      };
    };
  };
  regionalData: { [key: string]: { name: string; weight: number; growth: number } };
  productCategories: Array<{ name: string; revenueShare: number; margin: number }>;
  timePatterns: {
    [key: string]: { hours: number[]; multiplier: number };
  };
}

/**
 * 增强型数据生成器
 * 使用预置业务数据生成更真实的模拟数据
 */
export class EnhancedDataGenerator {
  private config: BusinessDataConfig;

  constructor() {
    // 加载配置
    const configPath = path.resolve(process.cwd(), 'data/mock/businessData.json');
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('[EnhancedDataGenerator] Failed to load config:', error);
      // 使用默认配置
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * 生成数据
   */
  generateData(
    scenario: ScenarioType,
    previousData?: any
  ): ExtendedGeneratedData {
    const scenarioConfig = this.config.scenarios[scenario] || this.config.scenarios.normal;

    // 生成指标数据
    const metrics = this.generateMetrics(scenarioConfig.baseMetrics, previousData);

    // 生成趋势数据
    const trend = this.generateTrend(metrics.find(m => m.name === '营业收入')?.value || 5000000);

    // 生成地区数据
    const regionalData = this.generateRegionalData(scenario);

    // 生成产品分类数据
    const productData = this.generateProductData(scenario);

    // 生成洞察和建议
    const insight = this.generateInsight(scenario, metrics);
    const suggestion = this.generateSuggestion(scenario);

    // 生成预警
    const alerts = this.generateAlerts(scenario, metrics);

    return {
      metrics,
      trend,
      regionalData,
      productData,
      insight,
      suggestion,
      alerts
    };
  }

  /**
   * 生成指标数据
   */
  private generateMetrics(
    baseMetrics: { [key: string]: { value: number; unit: string; volatility: number } },
    previousData?: any
  ): ExtendedMetric[] {
    const metrics: ExtendedMetric[] = [];
    const metricNames: Record<string, string> = {
      revenue: '营业收入',
      orders: '订单量',
      activeUsers: '活跃用户',
      conversionRate: '转化率',
      avgOrderValue: '客单价',
      grossMargin: '毛利率',
      repurchaseRate: '复购率'
    };

    Object.entries(baseMetrics).forEach(([key, config]) => {
      // 生成当前值（加入随机波动）
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * config.volatility;
      const value = this.roundValue(config.value * randomFactor, key);

      // 获取上期值
      const previousValue = previousData?.metrics?.find((m: any) => m.name === metricNames[key])?.value
        || config.value;

      const change = value - previousValue;
      const changePercent = this.roundValue((change / previousValue) * 100, key + '_percent');

      // 判断趋势
      let trend: 'up' | 'down' | 'stable';
      if (Math.abs(changePercent) < 2) {
        trend = 'stable';
      } else {
        trend = changePercent > 0 ? 'up' : 'down';
      }

      metrics.push({
        name: metricNames[key],
        value,
        previousValue,
        change,
        changePercent,
        unit: config.unit,
        trend
      });
    });

    return metrics;
  }

  /**
   * 生成趋势数据（12小时）
   */
  private generateTrend(baseValue: number): Array<{ timestamp: number; value: number }> {
    const trend: Array<{ timestamp: number; value: number }> = [];
    const now = Date.now();

    for (let i = 11; i >= 0; i--) {
      const timestamp = now - i * 3600000;
      const hour = new Date(timestamp).getHours();

      // 根据时间段调整
      let multiplier = 1;
      Object.values(this.config.timePatterns).forEach(pattern => {
        if (pattern.hours.includes(hour)) {
          multiplier = pattern.multiplier;
        }
      });

      // 添加随机波动
      const randomFactor = 0.85 + Math.random() * 0.3;
      const value = this.roundValue(baseValue * multiplier * randomFactor, 'revenue');

      trend.push({ timestamp, value });
    }

    return trend;
  }

  /**
   * 生成地区数据
   */
  private generateRegionalData(scenario: ScenarioType): RegionalData[] {
    const regionalData: RegionalData[] = [];
    const scenarioMultiplier = this.getScenarioMultiplier(scenario);

    Object.entries(this.config.regionalData).forEach(([key, config]) => {
      const baseValue = 5000000 * config.weight * scenarioMultiplier;
      const randomFactor = 0.9 + Math.random() * 0.2;
      const value = Math.round(baseValue * randomFactor);
      const changePercent = this.roundValue(config.growth * 100 * scenarioMultiplier + (Math.random() - 0.5) * 10, 'regional');

      regionalData.push({
        name: config.name,
        value,
        changePercent
      });
    });

    return regionalData.sort((a, b) => b.value - a.value);
  }

  /**
   * 生成产品分类数据
   */
  private generateProductData(scenario: ScenarioType): ProductCategoryData[] {
    const productData: ProductCategoryData[] = [];
    const scenarioMultiplier = this.getScenarioMultiplier(scenario);

    this.config.productCategories.forEach(category => {
      const baseRevenue = 5000000 * category.revenueShare * scenarioMultiplier;
      const randomFactor = 0.9 + Math.random() * 0.2;
      const revenue = Math.round(baseRevenue * randomFactor);

      productData.push({
        name: category.name,
        revenue,
        margin: category.margin + (Math.random() - 0.5) * 5,
        share: category.revenueShare * 100
      });
    });

    return productData.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * 生成数据洞察
   */
  private generateInsight(scenario: ScenarioType, metrics: ExtendedMetric[]): string {
    const revenue = metrics.find(m => m.name === '营业收入');
    const orders = metrics.find(m => m.name === '订单量');
    const users = metrics.find(m => m.name === '活跃用户');

    const scenarioInsights: Record<ScenarioType, string> = {
      normal: `本期业务运行平稳，营业收入${revenue?.changePercent > 0 ? '增长' : '下降'}${Math.abs(revenue?.changePercent || 0).toFixed(2)}%，活跃用户${users?.changePercent > 0 ? '增长' : '下降'}${Math.abs(users?.changePercent || 0).toFixed(2)}%。各项指标在正常范围内波动，整体趋势保持稳定。`,
      promotion: `受促销活动影响，本期营业收入大幅增长${revenue?.changePercent.toFixed(2)}%，订单量增长${orders?.changePercent.toFixed(2)}%。但毛利率下降至${revenue?.unit === '%' ? revenue?.value : '32'}%，促销成本对利润造成一定压力。`,
      off_season: `本期处于业务淡季，营业收入${revenue && revenue.changePercent < 0 ? '下降' : '仅增长'}${Math.abs(revenue?.changePercent || 0).toFixed(2)}%，活跃用户${users && users.changePercent < 0 ? '下降' : '增长'}${Math.abs(users?.changePercent || 0).toFixed(2)}%。建议在淡季加强成本控制和用户运营。`,
      anomaly: `⚠️ 本期数据出现异常波动，营业收入${revenue?.changePercent.toFixed(2)}%，活跃用户${users?.changePercent.toFixed(2)}%。需要立即排查原因，可能受外部因素影响。`
    };

    return scenarioInsights[scenario];
  }

  /**
   * 生成业务建议
   */
  private generateSuggestion(scenario: ScenarioType): string {
    const suggestions: Record<ScenarioType, string> = {
      normal: '建议：1. 持续关注核心指标变化趋势；2. 优化产品和服务质量；3. 保持良好的客户关系，提升复购率。',
      promotion: '建议：1. 继续加大促销推广力度，扩大市场覆盖；2. 关注用户留存率，提升转化效果；3. 控制促销成本，提升ROI。',
      off_season: '建议：1. 优化成本结构，提升运营效率；2. 加强老客户维护，挖掘存量价值；3. 提前规划旺季储备，开发新产品线。',
      anomaly: '建议：1. 立即排查异常原因，制定应对方案；2. 加强风险监控，建立预警机制；3. 及时与相关部门沟通协调，降低影响。'
    };

    return suggestions[scenario];
  }

  /**
   * 生成预警信息
   */
  private generateAlerts(scenario: ScenarioType, metrics: ExtendedMetric[]): Array<{ level: 'info' | 'warning' | 'critical'; message: string }> {
    const alerts: Array<{ level: 'info' | 'warning' | 'critical'; message: string }> = [];

    // 根据指标生成预警
    metrics.forEach(metric => {
      if (metric.name === '毛利率' && metric.value < 30) {
        alerts.push({
          level: 'warning',
          message: `毛利率低于30%，需要关注成本控制`
        });
      }

      if (metric.name === '毛利率' && metric.value < 25) {
        alerts.push({
          level: 'critical',
          message: `毛利率严重偏低，请立即采取行动！`
        });
      }

      if (metric.name === '活跃用户' && metric.changePercent < -20) {
        alerts.push({
          level: 'warning',
          message: `活跃用户大幅下降${Math.abs(metric.changePercent).toFixed(2)}%`
        });
      }

      if (metric.name === '转化率' && metric.value < 2.5) {
        alerts.push({
          level: 'info',
          message: `转化率偏低，建议优化营销策略`
        });
      }
    });

    // 根据场景添加预警
    if (scenario === 'anomaly') {
      alerts.push({
        level: 'critical',
        message: '检测到异常事件，请立即处理！'
      });
    }

    return alerts;
  }

  /**
   * 获取场景乘数
   */
  private getScenarioMultiplier(scenario: ScenarioType): number {
    const multipliers: Record<ScenarioType, number> = {
      normal: 1.0,
      promotion: 1.5,
      off_season: 0.7,
      anomaly: 0.5
    };
    return multipliers[scenario] || 1.0;
  }

  /**
   * 四舍五入数值
   */
  private roundValue(value: number, type: string): number {
    if (type.includes('percent') || type.includes('Rate') || type === 'grossMargin' || type === 'repurchaseRate') {
      return Number(value.toFixed(2));
    }
    return Math.round(value);
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): BusinessDataConfig {
    return {
      scenarios: {
        normal: {
          name: '正常运营',
          description: '业务平稳发展',
          baseMetrics: {
            revenue: { value: 5000000, unit: '元', volatility: 0.05 },
            orders: { value: 12000, unit: '单', volatility: 0.08 },
            activeUsers: { value: 120000, unit: '人', volatility: 0.06 },
            conversionRate: { value: 3.2, unit: '%', volatility: 0.1 },
            avgOrderValue: { value: 417, unit: '元', volatility: 0.04 },
            grossMargin: { value: 35, unit: '%', volatility: 0.03 },
            repurchaseRate: { value: 28, unit: '%', volatility: 0.08 }
          }
        },
        promotion: {
          name: '促销活动',
          description: '促销带来增长',
          baseMetrics: {
            revenue: { value: 7500000, unit: '元', volatility: 0.12 },
            orders: { value: 20000, unit: '单', volatility: 0.15 },
            activeUsers: { value: 180000, unit: '人', volatility: 0.1 },
            conversionRate: { value: 4.5, unit: '%', volatility: 0.15 },
            avgOrderValue: { value: 375, unit: '元', volatility: 0.08 },
            grossMargin: { value: 32, unit: '%', volatility: 0.05 },
            repurchaseRate: { value: 35, unit: '%', volatility: 0.1 }
          }
        },
        off_season: {
          name: '业务淡季',
          description: '市场需求疲软',
          baseMetrics: {
            revenue: { value: 3500000, unit: '元', volatility: 0.1 },
            orders: { value: 8000, unit: '单', volatility: 0.12 },
            activeUsers: { value: 90000, unit: '人', volatility: 0.08 },
            conversionRate: { value: 2.8, unit: '%', volatility: 0.12 },
            avgOrderValue: { value: 438, unit: '元', volatility: 0.06 },
            grossMargin: { value: 33, unit: '%', volatility: 0.04 },
            repurchaseRate: { value: 25, unit: '%', volatility: 0.1 }
          }
        },
        anomaly: {
          name: '异常事件',
          description: '突发情况',
          baseMetrics: {
            revenue: { value: 2500000, unit: '元', volatility: 0.3 },
            orders: { value: 5000, unit: '单', volatility: 0.4 },
            activeUsers: { value: 60000, unit: '人', volatility: 0.25 },
            conversionRate: { value: 2.0, unit: '%', volatility: 0.3 },
            avgOrderValue: { value: 500, unit: '元', volatility: 0.15 },
            grossMargin: { value: 28, unit: '%', volatility: 0.1 },
            repurchaseRate: { value: 18, unit: '%', volatility: 0.2 }
          }
        }
      },
      regionalData: {
        east: { name: '华东区', weight: 0.35, growth: 0.08 },
        south: { name: '华南区', weight: 0.28, growth: 0.12 },
        north: { name: '华北区', weight: 0.22, growth: 0.05 },
        west: { name: '西部区', weight: 0.15, growth: 0.15 }
      },
      productCategories: [
        { name: '电子产品', revenueShare: 0.45, margin: 28 },
        { name: '家居用品', revenueShare: 0.25, margin: 35 },
        { name: '服装服饰', revenueShare: 0.18, margin: 42 },
        { name: '食品饮料', revenueShare: 0.12, margin: 25 }
      ],
      timePatterns: {
        morning: { hours: [6, 7, 8, 9, 10, 11], multiplier: 0.6 },
        noon: { hours: [12, 13, 14], multiplier: 0.4 },
        afternoon: { hours: [15, 16, 17], multiplier: 0.9 },
        evening: { hours: [18, 19, 20, 21], multiplier: 1.2 },
        night: { hours: [22, 23, 0, 1, 2, 3, 4, 5], multiplier: 0.2 }
      }
    };
  }
}

export default new EnhancedDataGenerator();
