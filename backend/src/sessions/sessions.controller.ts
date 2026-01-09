import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * 创建会话
   */
  @Post()
  async createSession(
    @Body()
    data: {
      name: string;
      recording_quality: string;
      transcription_language: string;
    }
  ) {
    return this.sessionsService.createSession(data);
  }

  /**
   * 获取会话列表
   */
  @Get()
  async getSessionList(
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
    @Query('status') status?: 'active' | 'ended',
    @Query('keyword') keyword?: string
  ) {
    return this.sessionsService.getSessionList({
      page,
      page_size,
      status,
      keyword,
    });
  }

  /**
   * 获取会话详情
   */
  @Get(':id')
  async getSessionDetail(@Param('id') id: string) {
    return this.sessionsService.getSessionDetail(id);
  }

  /**
   * 结束会话
   */
  @Post(':id/end')
  async endSession(@Param('id') id: string) {
    return this.sessionsService.endSession(id);
  }
}
