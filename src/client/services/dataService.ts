import axios from 'axios';
import keyService from './keyService';

/**
 * 场景类型
 */
export type ScenarioType = 'normal' | 'promotion' | 'off_season' | 'anomaly' | 'custom';

/**
 * 场景信息
 */
export interface Scenario {
  value: ScenarioType;
  label: string;
  description: string;
}

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
export interface ProductCategoryData {
  name: string;
  revenue: number;
  margin: number;
  share: number;
}

/**
 * 预警信息
 */
export interface AlertData {
  level: 'info' | 'warning' | 'critical';
  message: string;
}

/**
 * AI生成的数据
 */
export interface AIGeneratedData {
  metrics: MetricData[];
  trend: TrendPoint[];
  regionalData?: RegionalData[];
  productData?: ProductCategoryData[];
  insight: string;
  suggestion: string;
  alerts?: AlertData[];
}

/**
 * 数据生成请求
 */
export interface DataGenerateRequest {
  scenario: ScenarioType;
  scenarioDescription?: string;
  previousData?: {
    revenue?: number;
    grossMargin?: number;
    activeUsers?: number;
  };
}

/**
 * 数据生成响应
 */
interface DataGenerateResponse {
  success: boolean;
  data?: AIGeneratedData;
  error?: string;
}

/**
 * 场景列表响应
 */
interface ScenariosResponse {
  success: boolean;
  scenarios?: Scenario[];
  error?: string;
}

/**
 * 数据服务类
 */
class DataService {
  private baseURL = '/api/data';

  /**
   * 生成AI数据
   */
  async generateData(request: DataGenerateRequest): Promise<AIGeneratedData> {
    try {
      const apiKey = keyService.getModelScopeApiKey();
      if (!apiKey) {
        throw new Error('未配置魔搭API密钥');
      }

      const response = await axios.post<DataGenerateResponse>(
        `${this.baseURL}/generate`,
        request,
        {
          headers: {
            'x-modelscope-api-key': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || '数据生成失败');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('[DataService] Generate error:', error);
      throw error;
    }
  }

  /**
   * 获取可用场景列表
   */
  async getScenarios(): Promise<Scenario[]> {
    try {
      const response = await axios.get<ScenariosResponse>(`${this.baseURL}/scenarios`);

      if (!response.data.success || !response.data.scenarios) {
        throw new Error(response.data.error || '获取场景列表失败');
      }

      return response.data.scenarios;
    } catch (error: any) {
      console.error('[DataService] Get scenarios error:', error);
      // 返回默认场景列表
      return [
        { value: 'normal', label: '正常运营', description: '业务平稳发展，小幅增长' },
        { value: 'promotion', label: '促销活动', description: '促销带来数据大幅上升' },
        { value: 'off_season', label: '业务淡季', description: '市场需求疲软，数据下降' },
        { value: 'anomaly', label: '异常事件', description: '突发情况导致数据异常' },
        { value: 'custom', label: '自定义场景', description: '描述特定场景，AI生成数据' }
      ];
    }
  }
}

export default new DataService();
