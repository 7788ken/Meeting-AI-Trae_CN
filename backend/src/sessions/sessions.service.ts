import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../models/session.model';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(Session.name) private sessionModel: Model<SessionDocument>) {}

  /**
   * 创建会话
   */
  async createSession(data: {
    name: string;
    recording_quality: string;
    transcription_language: string;
  }) {
    const session = new this.sessionModel({
      name: data.name,
      recording_quality: data.recording_quality,
      transcription_language: data.transcription_language,
      status: 'active',
      created_at: new Date(),
    });
    return session.save();
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

    const query: any = {};
    if (params?.status) {
      query.status = params.status;
    }
    if (params?.keyword) {
      query.name = { $regex: params.keyword, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.sessionModel.find(query).skip(skip).limit(page_size).sort({ created_at: -1 }),
      this.sessionModel.countDocuments(query),
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
    return this.sessionModel.findById(id);
  }

  /**
   * 结束会话
   */
  async endSession(id: string) {
    const session = await this.sessionModel.findById(id);

    if (!session) {
      return null;
    }

    const duration = Math.floor(
      (new Date().getTime() - session.created_at.getTime()) / 1000
    );

    return this.sessionModel.findByIdAndUpdate(id, {
      status: 'ended',
      ended_at: new Date(),
      duration,
    }, { new: true });
  }
}
