import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 获取支持的AI模型列表
   */
  @Get('models')
  async getAIModels() {
    return this.aiService.getAIModels();
  }
}

