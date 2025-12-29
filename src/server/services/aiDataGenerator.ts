import axios from 'axios';

/**
 * 场景类型定义
 */
export type ScenarioType = 'normal' | 'promotion' | 'off_season' | 'anomaly' | 'custom';

/**
 * 场景描述
 */
export const SCENARIOS: Record<ScenarioType, string> = {
  normal: '正常运营',
  promotion: '促销活动',
  off_season: '业务淡季',
  anomaly: '异常事件',
  custom: '自定义场景'
};

/**
 * 指标数据
 */
export interface MetricData {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

/**
 * 趋势数据点
 */
export interface TrendPoint {
  timestamp: number;
  value: number;
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
export interface ProductData {
  name: string;
  revenue: number;
  margin: number;
  share: number;
}

/**
 * 预警数据
 */
export interface AlertData {
  level: 'info' | 'warning' | 'critical';
  message: string;
}

/**
 * AI生成数据响应
 */
export interface AIGeneratedData {
  metrics: MetricData[];
  trend: TrendPoint[];
  regionalData: RegionalData[];
  productData: ProductData[];
  insight: string;
  suggestion: string;
  alerts: AlertData[];
}

/**
 * 数据生成请求
 */
export interface DataGenerateRequest {
  scenario: ScenarioType;
  scenarioDescription?: string; // 自定义场景时的描述
  previousData?: {
    revenue?: number;
    grossMargin?: number;
    activeUsers?: number;
  };
}

/**
 * AI数据生成服务
 * 使用魔搭社区AI生成模拟业务数据
 */
export class AIDataGeneratorService {
  private baseURL: string = 'https://api-inference.modelscope.cn/v1';

  /**
   * 生成AI数据
   */
  async generateData(
    request: DataGenerateRequest,
    apiKey: string
  ): Promise<AIGeneratedData> {
    const { scenario, scenarioDescription, previousData } = request;

    // 构建场景描述
    const scenarioDesc = this.getScenarioDescription(scenario, scenarioDescription);

    // 构建Prompt
    const prompt = this.buildPrompt(scenarioDesc, previousData);

    try {
      // 调用魔搭AI
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-ai/DeepSeek-V3.2',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的BI数据模拟器。你生成的所有数据都必须是真实的、合理的、符合业务逻辑的。严格按照用户要求的格式返回JSON数据，不要包含任何其他文字说明。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2分钟超时
        }
      );

      // 解析AI返回的内容
      const content = response.data.choices[0].message.content;
      return this.parseAIResponse(content);
    } catch (error: any) {
      console.error('[AIDataGenerator] AI调用失败:', error);

      // 如果AI调用失败，返回基于规则的降级数据
      return this.getFallbackData(scenario, previousData);
    }
  }

  /**
   * 获取场景描述
   */
  private getScenarioDescription(scenario: ScenarioType, customDesc?: string): string {
    if (scenario === 'custom' && customDesc) {
      return customDesc;
    }

    const descriptions: Record<ScenarioType, string> = {
      normal: '正常运营状态，业务平稳发展，各项指标在小幅范围内正常波动，整体呈现缓慢上升趋势。',
      promotion: '正在开展大型促销活动，市场反响热烈，各项指标出现明显增长，客流量和销售额大幅提升。',
      off_season: '处于业务淡季，市场需求相对疲软，各项指标有所下降，需要在降本增效上下功夫。',
      anomaly: '出现突发异常情况（如系统故障、供应链问题等），导致数据出现异常波动，需要紧急处理。',
      custom: customDesc || '正常运营状态'
    };

    return descriptions[scenario];
  }

  /**
   * 构建AI Prompt
   */
  private buildPrompt(scenarioDesc: string, previousData?: DataGenerateRequest['previousData']): string {
    let prompt = `请根据以下场景生成业务数据：

场景描述：${scenarioDesc}

`;

    if (previousData) {
      prompt += `上期参考数据：
- 营业收入：${previousData.revenue || 5000000} 元
- 毛利率：${previousData.grossMargin || 35}%
- 活跃用户：${previousData.activeUsers || 120000} 人

`;
    }

    prompt += `请生成以下格式的JSON数据（严格遵循格式，不要添加任何其他文字）：
{
  "metrics": [
    {
      "name": "营业收入",
      "value": 具体数值(元，整数),
      "previousValue": ${previousData?.revenue || 5000000},
      "change": 变化额(整数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "元",
      "trend": "up或down或stable"
    },
    {
      "name": "订单量",
      "value": 具体数值(单，整数),
      "previousValue": 12000,
      "change": 变化额(整数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "单",
      "trend": "up或down或stable"
    },
    {
      "name": "毛利率",
      "value": 具体数值(百分比，保留2位小数),
      "previousValue": ${previousData?.grossMargin || 35},
      "change": 变化额(保留2位小数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "%",
      "trend": "up或down或stable"
    },
    {
      "name": "活跃用户",
      "value": 具体数值(人，整数),
      "previousValue": ${previousData?.activeUsers || 120000},
      "change": 变化额(整数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "人",
      "trend": "up或down或stable"
    },
    {
      "name": "转化率",
      "value": 具体数值(百分比，保留2位小数),
      "previousValue": 3.2,
      "change": 变化额(保留2位小数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "%",
      "trend": "up或down或stable"
    },
    {
      "name": "客单价",
      "value": 具体数值(元，整数),
      "previousValue": 417,
      "change": 变化额(整数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "元",
      "trend": "up或down或stable"
    },
    {
      "name": "复购率",
      "value": 具体数值(百分比，保留2位小数),
      "previousValue": 28,
      "change": 变化额(保留2位小数),
      "changePercent": 变化百分比(保留2位小数),
      "unit": "%",
      "trend": "up或down或stable"
    }
  ],
  "trend": [
    {"timestamp": ${Date.now() - 11 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 10 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 9 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 8 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 7 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 6 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 5 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 4 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 3 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 2 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now() - 1 * 3600000}, "value": 数值},
    {"timestamp": ${Date.now()}, "value": 数值}
  ],
  "regionalData": [
    {"name": "华东区", "value": 营收数值(整数), "changePercent": 增长率(保留2位小数)},
    {"name": "华南区", "value": 营收数值(整数), "changePercent": 增长率(保留2位小数)},
    {"name": "华北区", "value": 营收数值(整数), "changePercent": 增长率(保留2位小数)},
    {"name": "西部区", "value": 营收数值(整数), "changePercent": 增长率(保留2位小数)}
  ],
  "productData": [
    {"name": "电子产品", "revenue": 营收数值(整数), "margin": 毛利率(保留2位小数), "share": 市场份额(保留2位小数)},
    {"name": "家居用品", "revenue": 营收数值(整数), "margin": 毛利率(保留2位小数), "share": 市场份额(保留2位小数)},
    {"name": "服装服饰", "revenue": 营收数值(整数), "margin": 毛利率(保留2位小数), "share": 市场份额(保留2位小数)},
    {"name": "食品饮料", "revenue": 营收数值(整数), "margin": 毛利率(保留2位小数), "share": 市场份额(保留2位小数)}
  ],
  "insight": "数据洞察：用2-3句话分析当前数据变化特征、主要原因和业务影响。",
  "suggestion": "建议：针对当前数据情况提出1-2条具体的、可操作的业务建议。",
  "alerts": [
    {"level": "info或warning或critical", "message": "预警信息描述"}
  ]
}

注意：
1. 只返回JSON数据，不要添加任何其他文字说明
2. 所有数值必须真实合理，符合业务逻辑
3. trend数组中的数值要体现时间变化的趋势
4. changePercent计算公式：(value - previousValue) / previousValue * 100，保留2位小数
5. 根据场景特点生成数据，如促销场景各项指标应该有明显上升
6. regionalData按营收从高到低排序，productData按营收从高到低排序
7. alerts数组根据指标异常情况生成预警，如毛利率低于30%生成warning预警`;

    return prompt;
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(content: string): AIGeneratedData {
    try {
      // 尝试直接解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);

        // 确保数据格式正确
        if (data.metrics && data.trend && data.insight && data.suggestion) {
          return {
            metrics: data.metrics,
            trend: data.trend,
            regionalData: data.regionalData || [],
            productData: data.productData || [],
            insight: data.insight,
            suggestion: data.suggestion,
            alerts: data.alerts || []
          };
        }
      }

      throw new Error('AI返回格式不正确');
    } catch (error) {
      console.error('[AIDataGenerator] 解析AI响应失败:', error);
      throw error;
    }
  }

  /**
   * 降级数据生成（AI调用失败时使用）
   */
  private getFallbackData(
    scenario: ScenarioType,
    previousData?: DataGenerateRequest['previousData']
  ): AIGeneratedData {
    const prevRevenue = previousData?.revenue || 5000000;
    const prevMargin = previousData?.grossMargin || 35;
    const prevUsers = previousData?.activeUsers || 120000;

    let revenueMultiplier = 1;
    let marginMultiplier = 1;
    let usersMultiplier = 1;

    // 根据场景调整数据
    switch (scenario) {
      case 'promotion':
        revenueMultiplier = 1.2 + Math.random() * 0.3; // 20-50%增长
        marginMultiplier = 0.9 + Math.random() * 0.1; // 毛利率可能略降
        usersMultiplier = 1.3 + Math.random() * 0.4; // 30-70%增长
        break;
      case 'off_season':
        revenueMultiplier = 0.7 + Math.random() * 0.15; // 15-30%下降
        marginMultiplier = 0.95 + Math.random() * 0.05; // 毛利率略降
        usersMultiplier = 0.75 + Math.random() * 0.15; // 15-25%下降
        break;
      case 'anomaly':
        revenueMultiplier = 0.5 + Math.random() * 0.3; // 大幅波动
        marginMultiplier = 0.8 + Math.random() * 0.3;
        usersMultiplier = 0.6 + Math.random() * 0.4;
        break;
      default: // normal
        revenueMultiplier = 1.02 + Math.random() * 0.08; // 2-10%增长
        marginMultiplier = 0.98 + Math.random() * 0.06;
        usersMultiplier = 1.03 + Math.random() * 0.1;
    }

    const revenue = Math.round(prevRevenue * revenueMultiplier);
    const margin = Number((prevMargin * marginMultiplier).toFixed(2));
    const users = Math.round(prevUsers * usersMultiplier);

    const revenueChange = revenue - prevRevenue;
    const revenueChangePercent = Number(((revenueChange / prevRevenue) * 100).toFixed(2));
    const marginChange = Number((margin - prevMargin).toFixed(2));
    const marginChangePercent = Number(((marginChange / prevMargin) * 100).toFixed(2));
    const usersChange = users - prevUsers;
    const usersChangePercent = Number(((usersChange / prevUsers) * 100).toFixed(2));

    // 生成趋势数据
    const trend: TrendPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const timestamp = Date.now() - i * 3600000;
      const randomFactor = 0.9 + Math.random() * 0.2;
      trend.push({
        timestamp,
        value: Math.round(revenue * randomFactor * (1 - i * 0.02))
      });
    }

    // 生成更多指标数据
    const orders = Math.round(12000 * revenueMultiplier);
    const ordersChange = orders - 12000;
    const ordersChangePercent = Number(((ordersChange / 12000) * 100).toFixed(2));

    const conversionRate = Number((3.2 * (0.9 + Math.random() * 0.2)).toFixed(2));
    const conversionChange = Number((conversionRate - 3.2).toFixed(2));
    const conversionChangePercent = Number(((conversionChange / 3.2) * 100).toFixed(2));

    const avgOrderValue = Math.round(417 * (0.95 + Math.random() * 0.1));
    const avgOrderChange = avgOrderValue - 417;
    const avgOrderChangePercent = Number(((avgOrderChange / 417) * 100).toFixed(2));

    const repurchaseRate = Number((28 * (0.9 + Math.random() * 0.2)).toFixed(2));
    const repurchaseChange = Number((repurchaseRate - 28).toFixed(2));
    const repurchaseChangePercent = Number(((repurchaseChange / 28) * 100).toFixed(2));

    // 生成地区数据
    const regionalData = [
      { name: '华东区', value: Math.round(revenue * 0.35), changePercent: Number((8 * revenueMultiplier + (Math.random() - 0.5) * 5).toFixed(2)) },
      { name: '华南区', value: Math.round(revenue * 0.28), changePercent: Number((12 * revenueMultiplier + (Math.random() - 0.5) * 5).toFixed(2)) },
      { name: '华北区', value: Math.round(revenue * 0.22), changePercent: Number((5 * revenueMultiplier + (Math.random() - 0.5) * 5).toFixed(2)) },
      { name: '西部区', value: Math.round(revenue * 0.15), changePercent: Number((15 * revenueMultiplier + (Math.random() - 0.5) * 5).toFixed(2)) }
    ].sort((a, b) => b.value - a.value);

    // 生成产品数据
    const productData = [
      { name: '电子产品', revenue: Math.round(revenue * 0.45), margin: Number((28 + (Math.random() - 0.5) * 5).toFixed(2)), share: 45 },
      { name: '家居用品', revenue: Math.round(revenue * 0.25), margin: Number((35 + (Math.random() - 0.5) * 5).toFixed(2)), share: 25 },
      { name: '服装服饰', revenue: Math.round(revenue * 0.18), margin: Number((42 + (Math.random() - 0.5) * 5).toFixed(2)), share: 18 },
      { name: '食品饮料', revenue: Math.round(revenue * 0.12), margin: Number((25 + (Math.random() - 0.5) * 5).toFixed(2)), share: 12 }
    ].sort((a, b) => b.revenue - a.revenue);

    // 生成预警
    const alerts: AlertData[] = [];
    if (margin < 30) {
      alerts.push({ level: 'warning', message: `毛利率低于30%，需要关注成本控制` });
    }
    if (margin < 25) {
      alerts.push({ level: 'critical', message: `毛利率严重偏低，请立即采取行动！` });
    }
    if (usersChangePercent < -20) {
      alerts.push({ level: 'warning', message: `活跃用户大幅下降${Math.abs(usersChangePercent).toFixed(2)}%` });
    }
    if (conversionRate < 2.5) {
      alerts.push({ level: 'info', message: `转化率偏低，建议优化营销策略` });
    }
    if (scenario === 'anomaly') {
      alerts.push({ level: 'critical', message: '检测到异常事件，请立即处理！' });
    }

    return {
      metrics: [
        {
          name: '营业收入',
          value: revenue,
          previousValue: prevRevenue,
          change: revenueChange,
          changePercent: revenueChangePercent,
          unit: '元',
          trend: revenueChangePercent > 0 ? 'up' : revenueChangePercent < 0 ? 'down' : 'stable'
        },
        {
          name: '订单量',
          value: orders,
          previousValue: 12000,
          change: ordersChange,
          changePercent: ordersChangePercent,
          unit: '单',
          trend: ordersChangePercent > 0 ? 'up' : ordersChangePercent < 0 ? 'down' : 'stable'
        },
        {
          name: '毛利率',
          value: margin,
          previousValue: prevMargin,
          change: marginChange,
          changePercent: marginChangePercent,
          unit: '%',
          trend: marginChangePercent > 0 ? 'up' : marginChangePercent < 0 ? 'down' : 'stable'
        },
        {
          name: '活跃用户',
          value: users,
          previousValue: prevUsers,
          change: usersChange,
          changePercent: usersChangePercent,
          unit: '人',
          trend: usersChangePercent > 0 ? 'up' : usersChangePercent < 0 ? 'down' : 'stable'
        },
        {
          name: '转化率',
          value: conversionRate,
          previousValue: 3.2,
          change: conversionChange,
          changePercent: conversionChangePercent,
          unit: '%',
          trend: conversionChangePercent > 0 ? 'up' : conversionChangePercent < 0 ? 'down' : 'stable'
        },
        {
          name: '客单价',
          value: avgOrderValue,
          previousValue: 417,
          change: avgOrderChange,
          changePercent: avgOrderChangePercent,
          unit: '元',
          trend: avgOrderChangePercent > 0 ? 'up' : avgOrderChangePercent < 0 ? 'down' : 'stable'
        },
        {
          name: '复购率',
          value: repurchaseRate,
          previousValue: 28,
          change: repurchaseChange,
          changePercent: repurchaseChangePercent,
          unit: '%',
          trend: repurchaseChangePercent > 0 ? 'up' : repurchaseChangePercent < 0 ? 'down' : 'stable'
        }
      ],
      trend,
      regionalData,
      productData,
      insight: this.getFallbackInsight(scenario, revenueChangePercent, usersChangePercent),
      suggestion: this.getFallbackSuggestion(scenario),
      alerts
    };
  }

  /**
   * 获取降级数据洞察
   */
  private getFallbackInsight(scenario: ScenarioType, revenueChangePercent: number, usersChangePercent: number): string {
    switch (scenario) {
      case 'promotion':
        return `本期受促销活动影响，营业收入增长${revenueChangePercent.toFixed(2)}%，活跃用户增长${usersChangePercent.toFixed(2)}%。促销活动效果显著，带动各项指标明显提升。`;
      case 'off_season':
        return `本期处于业务淡季，营业收入${revenueChangePercent > 0 ? '仅增长' + revenueChangePercent.toFixed(2) : '下降' + Math.abs(revenueChangePercent).toFixed(2)}%，活跃用户${usersChangePercent > 0 ? '增长' + usersChangePercent.toFixed(2) : '下降' + Math.abs(usersChangePercent).toFixed(2)}%。淡季效应明显，需加强成本控制。`;
      case 'anomaly':
        return `本期数据出现异常波动，可能受外部因素影响。建议深入分析异常原因，及时采取应对措施，降低对业务的影响。`;
      default:
        return `本期业务运行平稳，营业收入增长${revenueChangePercent.toFixed(2)}%，活跃用户增长${usersChangePercent.toFixed(2)}%。整体趋势向好，继续保持当前运营策略。`;
    }
  }

  /**
   * 获取降级建议
   */
  private getFallbackSuggestion(scenario: ScenarioType): string {
    switch (scenario) {
      case 'promotion':
        return '建议：1. 继续加大促销推广力度，扩大市场覆盖；2. 关注用户留存率，提升转化效果。';
      case 'off_season':
        return '建议：1. 优化成本结构，提升运营效率；2. 加强老客户维护，挖掘存量价值；3. 提前规划旺季储备。';
      case 'anomaly':
        return '建议：1. 立即排查异常原因，制定应对方案；2. 加强风险监控，建立预警机制；3. 及时与相关部门沟通协调。';
      default:
        return '建议：1. 持续关注核心指标变化趋势；2. 优化产品和服务质量；3. 保持良好的客户关系。';
    }
  }
}

export default new AIDataGeneratorService();
