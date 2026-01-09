import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  /**
   * 生成AI分析结果
   */
  async generateAnalysis(speechContent: string, modelName: string) {
    try {
      // 这里将在后续实现调用AI模型API的逻辑
      // 暂时模拟返回AI分析结果
      const mockAnalysis = {
        core_analysis: '这是核心要点分析',
        brief_answer: '这是简要回答',
        deep_answer: '这是深度回答，包含更详细的分析内容。',
        model_name: modelName,
        tokens_used: 100,
        confidence: 0.9,
      };

      return mockAnalysis;
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      throw new Error('Failed to generate AI analysis');
    }
  }

  /**
   * 获取支持的AI模型列表
   */
  getAIModels() {
    return [
      {
        name: 'qianwen',
        display_name: '字节跳动千问',
        description: '字节跳动推出的大语言模型',
        is_default: true,
        cost_per_1k_tokens: 0.15,
      },
      {
        name: 'doubao',
        display_name: '豆包',
        description: '字节跳动推出的大语言模型',
        is_default: false,
        cost_per_1k_tokens: 0.2,
      },
      {
        name: 'glm-4',
        display_name: '智谱GLM-4',
        description: '智谱AI推出的大语言模型',
        is_default: false,
        cost_per_1k_tokens: 0.2,
      },
      {
        name: 'minimax',
        display_name: 'MINIMAX',
        description: 'MINIMAX推出的大语言模型',
        is_default: false,
        cost_per_1k_tokens: 0.3,
      },
      {
        name: 'kimi',
        display_name: 'KIMI',
        description: '月之暗面推出的大语言模型',
        is_default: false,
        cost_per_1k_tokens: 0.4,
      },
      {
        name: 'dc',
        display_name: '深度求索',
        description: '深度求索推出的大语言模型',
        is_default: false,
        cost_per_1k_tokens: 0.5,
      },
    ];
  }

  /**
   * 调用AI模型API
   */
  private async callAIModelAPI(content: string, modelName: string) {
    try {
      // 这里将在后续实现调用具体AI模型API的逻辑
      // 暂时返回模拟数据
      return {
        core_analysis: '这是核心要点分析',
        brief_answer: '这是简要回答',
        deep_answer: '这是深度回答，包含更详细的分析内容。',
      };
    } catch (error) {
      console.error('Error calling AI model API:', error);
      throw new Error('Failed to call AI model API');
    }
  }
}
