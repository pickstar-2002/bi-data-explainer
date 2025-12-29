import express from 'express';
import aiDataGeneratorService from '../services/aiDataGenerator';
import enhancedDataGenerator from '../services/enhancedDataGenerator';

const router = express.Router();

/**
 * POST /api/data/generate
 *
 * 生成业务数据（优先使用增强生成器，AI失败时自动降级）
 *
 * 请求体：
 * {
 *   "scenario": "normal" | "promotion" | "off_season" | "anomaly" | "custom",
 *   "useAI": true/false,  // 是否尝试使用AI（默认true）
 *   "previousData": { ... }
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    const { scenario, scenarioDescription, previousData, useAI = true } = req.body;

    // 验证scenario
    const validScenarios = ['normal', 'promotion', 'off_season', 'anomaly', 'custom'];
    if (!scenario || !validScenarios.includes(scenario)) {
      return res.status(400).json({
        success: false,
        error: '无效的场景类型'
      });
    }

    // 验证custom场景需要描述
    if (scenario === 'custom' && !scenarioDescription) {
      return res.status(400).json({
        success: false,
        error: '自定义场景必须提供场景描述'
      });
    }

    let data;

    // 使用增强生成器（推荐）
    if (!useAI || scenario === 'custom') {
      // 直接使用增强生成器
      console.log('[DataAPI] Using enhanced data generator');
      data = enhancedDataGenerator.generateData(scenario, previousData);

      return res.json({
        success: true,
        data,
        source: 'enhanced'
      });
    }

    // 尝试使用AI生成
    if (useAI) {
      const apiKey = req.headers['x-modelscope-api-key'] as string;

      if (!apiKey) {
        // 没有API密钥，使用增强生成器
        console.log('[DataAPI] No API key, using enhanced generator');
        data = enhancedDataGenerator.generateData(scenario, previousData);

        return res.json({
          success: true,
          data,
          source: 'enhanced'
        });
      }

      try {
        // 尝试AI生成
        data = await Promise.race([
          aiDataGeneratorService.generateData(
            { scenario, scenarioDescription, previousData },
            apiKey
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI timeout')), 120000)
          )
        ] as any);

        return res.json({
          success: true,
          data,
          source: 'ai'
        });
      } catch (aiError) {
        console.log('[DataAPI] AI generation failed, using enhanced generator:', aiError);
        // AI失败，使用增强生成器
        data = enhancedDataGenerator.generateData(scenario, previousData);

        return res.json({
          success: true,
          data,
          source: 'enhanced'
        });
      }
    }

    res.json({
      success: true,
      data,
      source: 'enhanced'
    });
  } catch (error: any) {
    console.error('[DataAPI] Generate error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '数据生成失败'
    });
  }
});

/**
 * GET /api/data/scenarios
 *
 * 获取可用的场景列表
 */
router.get('/scenarios', (req, res) => {
  res.json({
    success: true,
    scenarios: [
      { value: 'normal', label: '正常运营', description: '业务平稳发展，小幅增长' },
      { value: 'promotion', label: '促销活动', description: '促销带来数据大幅上升' },
      { value: 'off_season', label: '业务淡季', description: '市场需求疲软，数据下降' },
      { value: 'anomaly', label: '异常事件', description: '突发情况导致数据异常' },
      { value: 'custom', label: '自定义场景', description: '描述特定场景，AI生成数据' }
    ]
  });
});

export default router;
