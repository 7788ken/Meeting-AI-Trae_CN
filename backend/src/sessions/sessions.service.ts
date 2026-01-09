import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 创建会话
   */
  async createSession(data: {
    name: string;
    recording_quality: string;
    transcription_language: string;
  }) {
    return this.prismaService.session.create({
      data: {
        name: data.name,
        recording_quality: data.recording_quality,
        transcription_language: data.transcription_language,
        status: 'active',
        created_at: new Date(),
      },
    });
  }

  /**
   * 获取会话列表
   */
  async getSessionList(params?: {
    page?: number;
    page_size?: number;
    status?: 'active' | 'ended';
    keyword?: string;
  }) {
    const page = params?.page || 1;
    const page_size = params?.page_size || 20;
    const skip = (page - 1) * page_size;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.keyword) {
      where.name = {
        contains: params.keyword,
      };
    }

    const [data, total] = await Promise.all([
      this.prismaService.session.findMany({
        where,
        skip,
        take: page_size,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prismaService.session.count({
        where,
      }),
    ]);

    return {
      total,
      page,
      page_size,
      data,
    };
  }

  /**
   * 获取会话详情
   */
  async getSessionDetail(id: string) {
    return this.prismaService.session.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * 结束会话
   */
  async endSession(id: string) {
    const session = await this.prismaService.session.findUnique({
      where: {
        id,
      },
    });

    if (!session) {
      return null;
    }

    const duration = Math.floor(
      (new Date().getTime() - session.created_at.getTime()) / 1000
    );

    return this.prismaService.session.update({
      where: {
        id,
      },
      data: {
        status: 'ended',
        ended_at: new Date(),
        duration,
      },
    });
  }
}
