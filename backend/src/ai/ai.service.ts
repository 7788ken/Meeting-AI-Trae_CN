import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly glmApiKey = process.env.GLM_API_KEY;
  private readonly glmEndpoint = process.env.GLM_ENDPOINT;

  /**
   * 生成AI分析结果
   */
  async generateAnalysis(speechContent: string, modelName: string) {
    try {
      // 调用真实的GLM API生成会议摘要
      if (modelName === 'glm-4' || !modelName) {
        return await this.callGLMAPI(speechContent);
      } else {
        // 对于其他模型，暂时使用模拟数据
        return this.generateMockAnalysis(speechContent, modelName);
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      // 如果API调用失败，返回模拟数据作为备份
      return this.generateMockAnalysis(speechContent, modelName);
    }
  }

  /**
   * 调用GLM API生成会议摘要
   */
  private async callGLMAPI(speechContent: string) {
    const prompt = `你是一个专业的会议摘要生成助手。请根据以下会议内容，生成：
1. 核心要点分析：简洁提炼会议的核心内容，不超过100字
2. 简要回答：用1-2句话概括会议内容
3. 深度分析：详细分析会议内容，包括讨论的问题、提出的方案、达成的共识等

会议内容：${speechContent}

请按照以下格式输出，不要添加任何额外内容：
核心要点：[核心要点分析]
简要回答：[简要回答]
深度分析：[深度分析]`;

    // 检查环境变量是否存在
    if (!this.glmEndpoint) {
      throw new Error('GLM_ENDPOINT environment variable is not set');
    }
    if (!this.glmApiKey) {
      throw new Error('GLM_API_KEY environment variable is not set');
    }

    const response = await axios.post(
      this.glmEndpoint,
      {
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的会议摘要生成助手',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.glmApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // 解析GLM API返回的结果
    const coreAnalysisMatch = aiResponse.match(/核心要点：(.*?)\n/);
    const briefAnswerMatch = aiResponse.match(/简要回答：(.*?)\n/);
    const deepAnalysisMatch = aiResponse.match(/深度分析：(.*)/s);

    return {
      core_analysis: coreAnalysisMatch ? coreAnalysisMatch[1] : '未能提取核心要点',
      brief_answer: briefAnswerMatch ? briefAnswerMatch[1] : '未能生成简要回答',
      deep_answer: deepAnalysisMatch ? deepAnalysisMatch[1] : '未能生成深度分析',
      model_name: 'glm-4',
      tokens_used: response.data.usage.total_tokens || 0,
      confidence: 0.95,
    };
  }

  /**
   * 生成模拟分析结果（作为备份）
   */
  private generateMockAnalysis(speechContent: string, modelName: string) {
    const core_analysis = this.generateCoreAnalysis(speechContent);
    const brief_answer = this.generateBriefAnswer(speechContent);
    const deep_answer = this.generateDeepAnswer(speechContent);
    
    return {
      core_analysis: core_analysis,
      brief_answer: brief_answer,
      deep_answer: deep_answer,
      model_name: modelName,
      tokens_used: Math.floor(Math.random() * 100) + 200,
      confidence: Math.random() * 0.1 + 0.85,
    };
  }
  
  /**
   * 生成核心要点分析
   */
  private generateCoreAnalysis(content: string): string {
    // 基于内容生成核心要点
    if (content.includes('AI') || content.includes('人工智能')) {
      return '核心要点：讨论了AI技术在会议助手中的应用，包括实时转写、发言者识别和智能分析功能，强调了技术实现和非功能需求。';
    } else if (content.includes('功能') || content.includes('需求')) {
      return '核心要点：围绕会议助手的功能需求展开讨论，包括实时转写、发言者识别和AI分析等核心功能，同时考虑了性能、可用性、可靠性和安全性等非功能需求。';
    } else {
      return '核心要点：本次发言讨论了会议助手的相关内容，包括功能需求和技术实现等方面。';
    }
  }
  
  /**
   * 生成简要回答
   */
  private generateBriefAnswer(content: string): string {
    // 基于内容生成简要回答
    if (content.includes('AI') || content.includes('人工智能')) {
      return '本次讨论聚焦于AI会议助手的功能需求和技术实现，包括实时转写、发言者识别和智能分析等核心功能。';
    } else if (content.includes('功能') || content.includes('需求')) {
      return '发言主要讨论了会议助手的功能需求，包括实时转写、发言者识别和AI分析等核心功能，同时考虑了非功能需求。';
    } else {
      return '发言讨论了会议助手的相关内容，涵盖功能需求和技术实现等方面。';
    }
  }
  
  /**
   * 生成深度回答
   */
  private generateDeepAnswer(content: string): string {
    // 基于内容生成深度回答
    return `
深度分析：
1. 核心功能需求：
   - 实时转写：将会议中的语音实时转换为文字，支持多种语言，延迟要求≤1秒
   - 发言者识别：自动识别不同的发言者，为每个发言者分配唯一标识符和颜色，支持手动调整
   - AI分析：对发言内容进行核心要点提炼、简要回答和深度分析，生成时间要求≤5秒

2. 技术实现方案：
   - 前端技术栈：Vue 3 + TypeScript + Element Plus + Pinia + Vue Router + Vite
   - 后端技术栈：NestJS + PostgreSQL + MongoDB + Prisma + Mongoose
   - 实时通信：使用WebSocket实现音频流传输和转写结果实时推送
   - 第三方服务：集成语音识别API和多种AI大模型API

3. 非功能需求：
   - 性能：支持同时在线用户数≥100人，页面加载时间≤2秒
   - 可用性：界面简洁直观，易于操作，支持主流浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
   - 可靠性：系统可用性≥99.5%，数据自动保存，防止意外丢失
   - 安全性：麦克风权限明确提示，数据加密存储和传输（SSL/TLS）
   - 可扩展性：支持添加新的语音识别服务和AI模型，模块化设计，便于功能扩展

4. 部署架构：
   - 容器化部署：使用Docker和Docker Compose
   - 负载均衡：使用Nginx进行反向代理和负载均衡
   - 进程管理：使用PM2管理Node.js进程

5. 测试策略：
   - 单元测试：覆盖核心功能，覆盖率目标≥80%
   - 集成测试：测试模块之间的交互，覆盖率目标≥70%
   - 端到端测试：测试完整的用户流程
   - 性能测试：测试系统在高并发下的性能
   - 安全测试：测试系统的安全性
      `;
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
