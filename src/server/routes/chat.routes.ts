import express from 'express';
import chatService from '../services/chatService';

const router = express.Router();

/**
 * POST /api/chat/stream
 *
 * 流式对话接口
 */
router.post('/stream', async (req, res) => {
  try {
    const { message, conversationHistory, currentData } = req.body;

    // 验证消息
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    // 从请求头获取API密钥
    const apiKey = req.headers['x-modelscope-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: '未提供魔搭API密钥'
      });
    }

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 发送开始标记
    res.write(`data: {"type":"start"}\n\n`);

    // 流式发送内容
    try {
      for await (const chunk of chatService.chatStream({
        message,
        conversationHistory: conversationHistory || [],
        currentData,
        apiKey
      })) {
        res.write(`data: {"type":"content","data":"${chunk.replace(/"/g, '\\"')}"}\n\n`);
      }

      // 发送结束标记
      res.write(`data: {"type":"end"}\n\n`);
    } catch (streamError) {
      console.error('[ChatAPI] Stream error:', streamError);
      res.write(`data: {"type":"error","error":"流式响应失败"}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('[ChatAPI] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || '对话处理失败'
      });
    }
  }
});

export default router;
