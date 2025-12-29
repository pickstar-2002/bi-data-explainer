import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 路由
import dataRoutes from './routes/data.routes';
import chatRoutes from './routes/chat.routes';

// 加载环境变量
dotenv.config({ path: '.env.server' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const isDev = process.env.NODE_ENV !== 'production';

// 中间件
app.use(cors());
app.use(express.json());

// API路由
app.use('/api/data', dataRoutes);
app.use('/api/chat', chatRoutes);
// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bi-data-explainer',
    mode: isDev ? 'development' : 'production',
    timestamp: new Date().toISOString()
  });
});

/**
 * 测试密钥接口
 */
app.post('/api/test-keys', async (req, res) => {
  const { modelscopeApiKey, xmovAppId, xmovAppSecret } = req.body;

  const results = {
    modelscopeValid: false,
    xmovValid: false,
    message: ''
  };

  try {
    // 测试魔搭 API 密钥
    try {
      const response = await axios.post(
        'https://api-inference.modelscope.cn/v1/chat/completions',
        {
          model: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${modelscopeApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.status === 200 || response.status === 401) {
        results.modelscopeValid = response.status === 200;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        results.modelscopeValid = false;
        results.message = '魔搭密钥无效或已过期';
      } else {
        results.modelscopeValid = false;
        results.message = `魔搭测试失败: ${error.message}`;
      }
    }

    // 测试魔珐星云密钥（前端格式验证）
    results.xmovValid = xmovAppId && xmovAppId.length > 10 && xmovAppSecret && xmovAppSecret.length > 10;

    if (!results.message) {
      results.message = results.modelscopeValid && results.xmovValid
        ? '所有密钥验证通过'
        : results.modelscopeValid
        ? '魔搭密钥有效，星云密钥格式正确'
        : '请检查密钥是否正确';
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({
      modelscopeValid: false,
      xmovValid: false,
      message: `测试失败: ${error.message}`
    });
  }
});

// 开发模式：代理Vite开发服务器
if (isDev) {
  console.log('[Server] Running in DEVELOPMENT mode');

  // 创建Vite开发服务器的中间件
  const { createServer: createViteServer } = await import('vite');

  // 获取项目根目录（从src/server/app.ts向上两级）
  const projectRoot = path.resolve(__dirname, '../..');

  const vite = await createViteServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: 'spa'  // 改为 spa 模式，让 Vite 自动处理 HTML
  });

  // 使用vite的connect实例作为中间件
  app.use(vite.middlewares);
} else {
  // 生产模式：提供静态文件
  console.log('[Server] Running in PRODUCTION mode');

  const distPath = path.resolve(__dirname, '../../dist');
  const indexPath = path.resolve(distPath, 'index.html');

  // 检查构建文件是否存在
  if (!fs.existsSync(distPath)) {
    console.error('[Server] Error: dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  // 提供静态文件
  app.use(express.static(distPath, { index: false }));

  // SPA支持：所有未匹配的路由返回index.html
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
}

// 启动服务
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  BI Data Explainer`);
  console.log(`========================================`);
  console.log(`  Mode:    ${isDev ? 'Development' : 'Production'}`);
  console.log(`  URL:     http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`========================================\n`);
});

export default app;
