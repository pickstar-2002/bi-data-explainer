import axios from 'axios';

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * 对话请求
 */
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  currentData?: any;
  apiKey: string;
}

/**
 * 对话服务
 */
export class ChatService {
  private baseURL = 'https://api-inference.modelscope.cn/v1';
  private model = 'deepseek-ai/DeepSeek-V3.2';

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(currentData?: any): string {
    let prompt = `你是一个专业的BI数据讲解助手，名为"小数据"。

你的职责：
1. 解读和讲解企业BI业务数据
2. 用通俗易懂的语言解释复杂数据
3. 发现数据中的趋势和异常
4. 回答用户关于数据的各种问题
5. 提供数据洞察和决策建议

讲解风格：
- 专业但不晦涩，善于用比喻解释数据
- 数据敏感，能快速发现异常和趋势
- 主动分享有价值的洞察
- 回答简洁明了，通常不超过3句话`;

    if (currentData) {
      prompt += `\n\n当前业务数据概况：\n`;
      prompt += `场景：${currentData.scenario || '正常运营'}\n`;

      if (currentData.metrics && Array.isArray(currentData.metrics)) {
        prompt += `\n【核心指标】\n`;
        currentData.metrics.slice(0, 7).forEach((m: any) => {
          const trendIcon = m.changePercent > 0 ? '↑' : m.changePercent < 0 ? '↓' : '→';
          prompt += `- ${m.name}: ${m.value.toLocaleString()}${m.unit} (${trendIcon}${Math.abs(m.changePercent).toFixed(2)}%)\n`;
        });
      }

      if (currentData.regionalData && Array.isArray(currentData.regionalData)) {
        prompt += `\n【地区数据】\n`;
        currentData.regionalData.forEach((r: any) => {
          const trendIcon = r.changePercent > 0 ? '↑' : r.changePercent < 0 ? '↓' : '→';
          prompt += `- ${r.name}: 营收${r.value.toLocaleString()}元 (${trendIcon}${Math.abs(r.changePercent).toFixed(2)}%)\n`;
        });
      }

      if (currentData.productData && Array.isArray(currentData.productData)) {
        prompt += `\n【产品数据】\n`;
        currentData.productData.forEach((p: any) => {
          prompt += `- ${p.name}: 营收${p.revenue.toLocaleString()}元，毛利率${p.margin.toFixed(2)}%，市场份额${p.share.toFixed(2)}%\n`;
        });
      }

      if (currentData.insight) {
        prompt += `\n【数据洞察】\n${currentData.insight}\n`;
      }

      if (currentData.suggestion) {
        prompt += `\n【业务建议】\n${currentData.suggestion}\n`;
      }

      if (currentData.alerts && currentData.alerts.length > 0) {
        prompt += `\n【当前预警】\n`;
        currentData.alerts.forEach((alert: any) => {
          prompt += `- [${alert.level}] ${alert.message}\n`;
        });
      } else {
        prompt += `\n【当前预警】\n当前各项指标正常，无预警信息。\n`;
      }

      if (currentData.trend && Array.isArray(currentData.trend)) {
        prompt += `\n【营收趋势】过去12小时数据：${currentData.trend.map((t: any) => t.value.toLocaleString()).join(' → ')}\n`;
      }
    }

    return prompt;
  }

  /**
   * 流式对话
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const { message, conversationHistory = [], currentData, apiKey } = request;

    // 构建消息列表
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(currentData),
        timestamp: Date.now()
      }
    ];

    // 添加历史消息（最近10条）
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 30000
        }
      );

      const stream = response.data;

      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[ChatService] Stream error:', error);

      // AI失败时返回降级响应
      const fallbackResponse = this.getFallbackResponse(message, currentData);
      yield fallbackResponse;
    }
  }

  /**
   * 降级响应（AI调用失败时）
   */
  private getFallbackResponse(message: string, currentData?: any): string {
    const lowerMessage = message.toLowerCase();

    // 关于营收
    if (lowerMessage.includes('营收') || lowerMessage.includes('收入')) {
      const revenue = currentData?.metrics?.find((m: any) => m.name === '营业收入');
      if (revenue) {
        const trend = revenue.changePercent > 0 ? '增长' : revenue.changePercent < 0 ? '下降' : '持平';
        return `当前营业收入为${revenue.value.toLocaleString()}元，较上期${trend}${Math.abs(revenue.changePercent).toFixed(2)}%。`;
      }
    }

    // 关于订单
    if (lowerMessage.includes('订单')) {
      const orders = currentData?.metrics?.find((m: any) => m.name === '订单量');
      if (orders) {
        const trend = orders.changePercent > 0 ? '增长' : orders.changePercent < 0 ? '下降' : '持平';
        return `当前订单量为${orders.value.toLocaleString()}单，较上期${trend}${Math.abs(orders.changePercent).toFixed(2)}%。`;
      }
    }

    // 关于用户
    if (lowerMessage.includes('用户') || lowerMessage.includes('活跃')) {
      const users = currentData?.metrics?.find((m: any) => m.name === '活跃用户');
      if (users) {
        const trend = users.changePercent > 0 ? '增长' : users.changePercent < 0 ? '下降' : '持平';
        return `当前活跃用户数为${users.value.toLocaleString()}人，较上期${trend}${Math.abs(users.changePercent).toFixed(2)}%。`;
      }
    }

    // 关于毛利
    if (lowerMessage.includes('毛利')) {
      const margin = currentData?.metrics?.find((m: any) => m.name === '毛利率');
      if (margin) {
        const trend = margin.changePercent > 0 ? '上升' : margin.changePercent < 0 ? '下降' : '持平';
        return `当前毛利率为${margin.value.toFixed(2)}%，较上期${trend}${Math.abs(margin.changePercent).toFixed(2)}个百分点。`;
      }
    }

    // 关于地区
    if (lowerMessage.includes('地区') || lowerMessage.includes('区域')) {
      if (currentData?.regionalData && currentData.regionalData.length > 0) {
        const topRegion = currentData.regionalData[0];
        return `${topRegion.name}表现最好，营收为${topRegion.value.toLocaleString()}元，增长${topRegion.changePercent.toFixed(2)}%。`;
      }
    }

    // 关于产品
    if (lowerMessage.includes('产品') || lowerMessage.includes('品类')) {
      if (currentData?.productData && currentData.productData.length > 0) {
        const topProduct = currentData.productData[0];
        return `${topProduct.name}营收最高，为${topProduct.revenue.toLocaleString()}元，毛利率${topProduct.margin.toFixed(2)}%。`;
      }
    }

    // 关于转化率
    if (lowerMessage.includes('转化')) {
      const conversion = currentData?.metrics?.find((m: any) => m.name === '转化率');
      if (conversion) {
        return `当前转化率为${conversion.value.toFixed(2)}%，较上期${conversion.changePercent > 0 ? '上升' : '下降'}${Math.abs(conversion.changePercent).toFixed(2)}%。`;
      }
    }

    // 关于客单价
    if (lowerMessage.includes('客单')) {
      const avgOrder = currentData?.metrics?.find((m: any) => m.name === '客单价');
      if (avgOrder) {
        return `当前客单价为${avgOrder.value}元，较上期${avgOrder.changePercent > 0 ? '上升' : '下降'}${Math.abs(avgOrder.changePercent).toFixed(2)}%。`;
      }
    }

    // 关于复购
    if (lowerMessage.includes('复购')) {
      const repurchase = currentData?.metrics?.find((m: any) => m.name === '复购率');
      if (repurchase) {
        return `当前复购率为${repurchase.value.toFixed(2)}%，较上期${repurchase.changePercent > 0 ? '上升' : '下降'}${Math.abs(repurchase.changePercent).toFixed(2)}%。`;
      }
    }

    // 关于预警
    if (lowerMessage.includes('预警') || lowerMessage.includes('异常')) {
      const alerts = currentData?.alerts || [];
      if (alerts.length > 0) {
        return `当前有${alerts.length}条预警：${alerts.map((a: any) => a.message).join('；')}`;
      }
      return '当前各项指标正常，无预警信息。';
    }

    // 关于建议
    if (lowerMessage.includes('建议') || lowerMessage.includes('怎么做')) {
      if (currentData?.suggestion) {
        return currentData.suggestion;
      }
    }

    // 默认响应 - 返回数据洞察
    if (currentData?.insight) {
      return currentData.insight;
    }

    return '抱歉，我暂时无法回答这个问题。请确保已配置有效的魔搭API密钥。';
  }
}

export default new ChatService();
