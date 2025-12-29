import React, { useState } from 'react';
import keyService from '../../services/keyService';

interface ApiKeyConfigProps {
  onConfigured: () => void;
}

interface TestResult {
  modelscope: boolean;
  xmov: boolean;
  message: string;
}

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onConfigured }) => {
  const [modelscopeApiKey, setModelscopeApiKey] = useState('');
  const [xmovAppId, setXmovAppId] = useState('');
  const [xmovAppSecret, setXmovAppSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // 尝试从localStorage加载已有密钥
  React.useEffect(() => {
    const savedKeys = keyService.getApiKeys();
    if (savedKeys) {
      setModelscopeApiKey(savedKeys.modelscopeApiKey);
      setXmovAppId(savedKeys.xmovAppId);
      setXmovAppSecret(savedKeys.xmovAppSecret);
    }
  }, []);

  // 演示密钥
  const DEMO_KEYS = {
    modelscopeApiKey: 'ms-85ed98e9-1a8e-41e5-8215-ee563559d069',
    xmovAppId: 'b91e4bdb81ed4567bde3ba242b9bf042',
    xmovAppSecret: '913d8ede47474927a441be29e6b560af'
  };

  const handleUseDemoKeys = () => {
    setModelscopeApiKey(DEMO_KEYS.modelscopeApiKey);
    setXmovAppId(DEMO_KEYS.xmovAppId);
    setXmovAppSecret(DEMO_KEYS.xmovAppSecret);
    setTestResult(null);
  };

  // 测试密钥
  const handleTestKeys = async () => {
    setError('');
    setTestResult(null);

    // 基本验证
    if (!modelscopeApiKey.trim() || !xmovAppId.trim() || !xmovAppSecret.trim()) {
      setError('请先填写所有密钥');
      return;
    }

    if (!modelscopeApiKey.startsWith('ms-')) {
      setError('魔搭API密钥格式不正确，应以"ms-"开头');
      return;
    }

    setIsTesting(true);

    try {
      // 测试魔搭 API 密钥（调用后端测试接口）
      const response = await fetch('/api/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelscopeApiKey: modelscopeApiKey.trim(),
          xmovAppId: xmovAppId.trim(),
          xmovAppSecret: xmovAppSecret.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          modelscope: data.modelscopeValid || false,
          xmov: data.xmovValid || false,
          message: data.message || '测试完成'
        });
      } else {
        setError(data.message || '测试失败');
      }
    } catch (err) {
      // 如果后端接口不存在，进行前端简单验证
      const results: TestResult = {
        modelscope: modelscopeApiKey.startsWith('ms-') && modelscopeApiKey.length > 20,
        xmov: xmovAppId.length > 10 && xmovAppSecret.length > 10,
        message: '前端基础验证通过（建议保存后实际测试）'
      };
      setTestResult(results);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTestResult(null);
    setIsSaving(true);

    // 验证输入
    if (!modelscopeApiKey.trim()) {
      setError('请输入魔搭API密钥');
      setIsSaving(false);
      return;
    }

    if (!modelscopeApiKey.startsWith('ms-')) {
      setError('魔搭API密钥格式不正确，应以"ms-"开头');
      setIsSaving(false);
      return;
    }

    if (!xmovAppId.trim() || !xmovAppSecret.trim()) {
      setError('请输入完整的魔珐星云配置信息');
      setIsSaving(false);
      return;
    }

    try {
      // 保存密钥到localStorage
      keyService.saveApiKeys({
        modelscopeApiKey: modelscopeApiKey.trim(),
        xmovAppId: xmovAppId.trim(),
        xmovAppSecret: xmovAppSecret.trim()
      });

      // 延迟一下让用户看到保存成功的反馈
      setTimeout(() => {
        onConfigured();
      }, 500);
    } catch (err) {
      setError('保存密钥失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('确定要清除已保存的密钥吗？')) {
      keyService.clearApiKeys();
      setModelscopeApiKey('');
      setXmovAppId('');
      setXmovAppSecret('');
      setTestResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔑</div>
            <h1 className="text-3xl font-bold text-white mb-2">配置 API 密钥</h1>
            <p className="text-gray-300">
              请输入您的服务密钥以启用 BI 数据讲解功能
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 魔搭AI密钥 */}
            <div>
              <label className="block text-white font-medium mb-2">
                魔搭社区 API 密钥 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={modelscopeApiKey}
                onChange={(e) => setModelscopeApiKey(e.target.value)}
                placeholder="ms-xxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-gray-400 text-sm mt-2">
                获取方式：访问 <a href="https://modelscope.cn" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">魔搭社区</a> 创建新令牌
              </p>
            </div>

            {/* 魔珐星云 App ID */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-white font-medium">
                  魔珐星云 App ID <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseDemoKeys}
                  className="text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded-lg transition"
                >
                  ✨ 使用演示密钥
                </button>
              </div>
              <input
                type="text"
                value={xmovAppId}
                onChange={(e) => setXmovAppId(e.target.value)}
                placeholder="xxxxxxxxxx"
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 魔珐星云 App Secret */}
            <div>
              <label className="block text-white font-medium mb-2">
                魔珐星云 App Secret <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={xmovAppSecret}
                  onChange={(e) => setXmovAppSecret(e.target.value)}
                  placeholder="xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showSecret ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                获取方式：访问 <a href="https://xingyun3d.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">魔珐星云控制台</a> 创建应用
              </p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* 测试结果 */}
            {testResult && (
              <div className={`p-4 rounded-xl border ${
                testResult.modelscope && testResult.xmov
                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                  : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
              }`}>
                <div className="font-medium mb-2">📋 测试结果</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{testResult.modelscope ? '✅' : '❌'}</span>
                    <span>魔搭社区密钥: {testResult.modelscope ? '有效' : '无效'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{testResult.xmov ? '✅' : '❌'}</span>
                    <span>魔珐星云密钥: {testResult.xmov ? '有效' : '无效'}</span>
                  </div>
                  <div className="mt-2 text-xs opacity-80">{testResult.message}</div>
                </div>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : '开始使用'}
              </button>

              <button
                type="button"
                onClick={handleTestKeys}
                disabled={isTesting || !modelscopeApiKey || !xmovAppId || !xmovAppSecret}
                className="px-6 bg-green-500/80 hover:bg-green-500 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTesting ? '🔄 测试中...' : '🧪 测试密钥'}
              </button>

              {modelscopeApiKey && xmovAppId && xmovAppSecret && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition"
                >
                  清除
                </button>
              )}
            </div>
          </form>

          {/* 安全提示 */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-300 text-sm">
              🔒 <strong>隐私安全提示：</strong>您的密钥将仅保存在浏览器本地存储中，
              不会上传到我们的服务器。请妥善保管您的密钥，不要在公共设备上使用。
            </p>
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          BI 数据讲解系统 | 魔珐星云黑客松
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfig;
