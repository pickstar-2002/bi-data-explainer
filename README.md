# BI 数据讲解：实时解读业务指标与趋势

基于魔珐星云3D数字人技术的智能BI数据讲解系统，能够实时解读企业业务数据指标与趋势。

## 功能特性

### 核心功能
- 🎬 **场景切换**：支持正常运营、促销活动、业务淡季、异常事件、自定义场景5种模式
- 🤖 **AI数据生成**：使用魔搭AI (DeepSeek-V3.2) 动态生成真实业务数据
- 📊 **7大核心指标**：营业收入、订单量、毛利率、活跃用户、转化率、客单价、复购率
- 🌍 **地区数据**：华东区、华南区、华北区、西部区的营收和增长分析
- 📦 **产品数据**：电子产品、家居用品、服装服饰、食品饮料的品类分析
- 💬 **智能对话**：AI助手根据当前数据回答业务问题
- 🔊 **语音播报**：数字人自动播报数据洞察，支持手动播报完整摘要
- ⚠️ **异常预警**：智能检测数据异常并生成预警信息

### UI特性
- 🎭 **数字人展示**：屏幕中央20%区域，圆形渐变背景
- 📺 **大屏适配**：1920x1080设计，自动缩放
- 🎨 **渐变进度条**：40秒AI生成进度可视化
- 🔄 **视图切换**：总览、地区、产品、对话4种视图模式

## 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **构建**：Vite 5.x
- **状态管理**：Zustand
- **样式**：TailwindCSS
- **图表**：ECharts 5.x
- **HTTP**：Axios

### 后端
- **运行时**：Node.js 18.x
- **框架**：Express + TypeScript
- **AI模型**：魔搭社区 DeepSeek-V3.2

### 数字人
- **SDK**：魔珐星云具身驱动SDK v0.1.0-alpha.45
- **功能**：语音合成、动作控制、状态监控

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
npm start
```

## 密钥配置

首次访问时需要配置以下密钥（存储在浏览器 localStorage）：

| 密钥 | 获取方式 | 用途 |
|------|----------|------|
| 魔搭社区 API 密钥 | [魔搭社区](https://modelscope.cn) 创建新令牌 | AI数据生成和对话 |
| 魔珐星云 App ID | [星云控制台](https://xingyun3d.com) 创建应用 | 数字人连接 |
| 魔珐星云 App Secret | 星云控制台获取 | 数字人认证 |

## 项目结构

```
bi-data-explainer/
├── src/
│   ├── client/                      # 前端代码
│   │   ├── components/
│   │   │   ├── Avatar/             # 数字人组件
│   │   │   │   ├── AvatarController.ts      # SDK控制器
│   │   │   │   └── AvatarContainer.tsx      # 数字人容器
│   │   │   ├── Chat/               # 对话组件
│   │   │   │   └── ChatBox.tsx              # AI对话框
│   │   │   ├── Config/             # 配置组件
│   │   │   │   └── ApiKeyConfig.tsx         # 密钥配置页
│   │   │   ├── Data/               # 数据组件
│   │   │   │   └── ScenarioSwitcher.tsx     # 场景切换器
│   │   │   ├── Dashboard/          # 大屏组件
│   │   │   │   ├── DashboardLayout.tsx      # 大屏布局
│   │   │   │   ├── MetricCard.tsx           # 指标卡片
│   │   │   │   ├── TrendChart.tsx           # 趋势图
│   │   │   │   ├── RegionalChart.tsx        # 地区图表
│   │   │   │   └── ProductChart.tsx         # 产品图表
│   │   │   └── Chart/              # 图表组件
│   │   │       └── index.ts                # 图表导出
│   │   ├── store/                      # 状态管理
│   │   │   ├── keyStore.ts              # 密钥状态
│   │   │   └── avatarStore.ts           # 数字人状态
│   │   ├── services/                   # 服务层
│   │   │   ├── keyService.ts            # 密钥管理
│   │   │   └── dataService.ts           # 数据服务
│   │   └── App.tsx                     # 主应用
│   ├── server/                      # 后端代码
│   │   ├── routes/                    # API路由
│   │   │   ├── data.routes.ts          # 数据生成接口
│   │   │   └── chat.routes.ts          # 对话接口
│   │   └── services/                  # 业务服务
│   │       ├── aiDataGenerator.ts     # AI数据生成
│   │       ├── enhancedDataGenerator.ts # 增强数据生成
│   │       └── chatService.ts         # 对话服务
│   └── shared/                      # 共享代码
├── data/                            # 数据文件
│   ├── knowledge/                   # 知识库数据
│   └── mock/                        # 模拟业务数据
└── public/                          # 静态资源
```

## API接口

### POST /api/data/generate

生成业务数据

**请求体：**
```json
{
  "scenario": "normal",
  "useAI": true,
  "previousData": { "metrics": [...] }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "name": "营业收入",
        "value": 5280000,
        "previousValue": 4800000,
        "change": 480000,
        "changePercent": 10.00,
        "unit": "元",
        "trend": "up"
      }
      // ... 共7个指标
    ],
    "trend": [
      { "timestamp": 1234567890, "value": 5000000 }
      // ... 共12个数据点
    ],
    "regionalData": [
      { "name": "华东区", "value": 1800000, "changePercent": 12.5 }
      // ... 共4个地区
    ],
    "productData": [
      { "name": "电子产品", "revenue": 2300000, "margin": 28.5, "share": 45 }
      // ... 共4个品类
    ],
    "insight": "本期业务运行平稳...",
    "suggestion": "建议持续关注核心指标...",
    "alerts": [
      { "level": "warning", "message": "毛利率低于30%" }
    ]
  },
  "source": "ai"
}
```

### POST /api/chat/stream

流式对话

**请求体：**
```json
{
  "message": "营收怎么样？",
  "conversationHistory": [],
  "currentData": { ... }
}
```

**响应流：**
```
data: {"type":"content","data":"当前"}
data: {"type":"content","data":"营业收入"}
data: {"type":"end"}
```

### GET /api/data/scenarios

获取可用场景列表

## 场景说明

| 场景 | 代码 | 数据特征 |
|------|------|----------|
| 正常运营 | `normal` | 业务平稳发展，各项指标小幅正常波动 |
| 促销活动 | `promotion` | 促销带动数据大幅上升，毛利率可能略降 |
| 业务淡季 | `off_season` | 市场需求疲软，数据下降趋势 |
| 异常事件 | `anomaly` | 突发情况导致数据异常波动 |
| 自定义场景 | `custom` | 用户描述特定场景，AI生成数据 |

## 环境变量

### .env.server
```bash
PORT=5177
NODE_ENV=development
MODELSCOPE_MODEL=deepseek-ai/DeepSeek-V3.2
EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B
```

## 注意事项

1. **密钥安全**：所有密钥存储在浏览器本地，不上传到服务器
2. **AI超时**：数据生成超时时间为120秒（2分钟）
3. **数字人连接**：需要有效的网络连接到魔珐星云服务
4. **大屏适配**：设计尺寸为1920x1080，自动缩放适配不同屏幕
5. **数据精度**：所有百分比保留2位小数

## 开发说明

### 数据生成流程
1. 用户选择场景
2. 前端调用 `/api/data/generate`
3. 后端使用魔搭AI生成数据（超时120秒）
4. AI失败时自动降级到增强生成器
5. 返回完整数据（7指标+地区+产品+洞察+建议+预警）

### 对话功能流程
1. 用户输入问题
2. 后端构建包含当前数据的系统提示词
3. 使用DeepSeek-V3.2流式生成回复
4. 支持降级响应（关键词匹配）

### 数字人播报
1. 数据生成完成后自动播报洞察
2. 支持手动点击"开始播报"按钮
3. 播报内容：4核心指标 + 最多2条预警 + 洞察 + 建议

## 许可证

MIT License

---

**魔珐星云黑客松作品**
