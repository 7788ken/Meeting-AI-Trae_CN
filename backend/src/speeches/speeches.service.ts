import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Speech, SpeechDocument } from '../models/speech.model';
import { AIAnalysis, AIAnalysisDocument } from '../models/ai-analysis.model';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SpeechesService {
  constructor(
    @InjectModel(Speech.name) private speechModel: Model<SpeechDocument>,
    @InjectModel(AIAnalysis.name) private aiAnalysisModel: Model<AIAnalysisDocument>,
    private aiService: AiService
  ) {}

  /**
   * 创建发言记录
   */
  async createSpeech(data: {
    session_id: string;
    speaker_id: string;
    speaker_name: string;
    content: string;
    start_time: Date;
    end_time: Date;
    confidence: number;
    audio_url?: string;
    metadata?: Record<string, any>;
  }) {
    const speech = new this.speechModel({
      ...data,
      duration: Math.floor((data.end_time.getTime() - data.start_time.getTime()) / 1000),
    });
    return speech.save();
  }

  /**
   * 获取会话的发言记录列表
   */
  async getSessionSpeeches(sessionId: string, params?: {
    page?: number;
    page_size?: number;
    speaker_id?: string;
    keyword?: string;
  }) {
    const page = params?.page || 1;
    const page_size = params?.page_size || 20;
    const skip = (page - 1) * page_size;

    const query: any = { session_id: sessionId };
    if (params?.speaker_id) {
      query.speaker_id = params.speaker_id;
    }
    if (params?.keyword) {
      query.content = {
        $regex: params.keyword,
        $options: 'i',
      };
    }

    const [data, total] = await Promise.all([
      this.speechModel.find(query)
        .skip(skip)
        .limit(page_size)
        .sort({ start_time: 'asc' })
        .exec(),
      this.speechModel.countDocuments(query).exec(),
    ]);

    return {
      total,
      page,
      page_size,
      data,
    };
  }

  /**
   * 获取发言记录详情
   */
  async getSpeechDetail(id: string) {
    return this.speechModel.findById(id).exec();
  }

  /**
   * 更新发言记录
   */
  async updateSpeech(id: string, data: {
    speaker_id?: string;
    speaker_name?: string;
    content?: string;
  }) {
    return this.speechModel.findByIdAndUpdate(id, {
      ...data,
      is_edited: true,
      edited_at: new Date(),
    }, { new: true }).exec();
  }

  /**
   * 删除发言记录
   */
  async deleteSpeech(id: string) {
    return this.speechModel.findByIdAndDelete(id).exec();
  }

  /**
   * 生成发言的AI分析
   */
  async analyzeSpeech(id: string, data: {
    model_name: string;
    prompt: string;
  }) {
    const speech = await this.speechModel.findById(id).exec();
    if (!speech) {
      throw new Error('Speech not found');
    }

    const analysisResult = await this.aiService.generateAnalysis(speech.content, data.model_name);
    
    const aiAnalysis = new this.aiAnalysisModel({
      speech_id: id,
      session_id: speech.session_id,
      model_name: data.model_name,
      core_analysis: analysisResult.core_analysis,
      brief_answer: analysisResult.brief_answer,
      deep_answer: analysisResult.deep_answer,
      prompt: data.prompt,
      tokens_used: analysisResult.tokens_used,
      confidence: analysisResult.confidence,
    });

    return aiAnalysis.save();
  }

  /**
   * 获取发言的AI分析列表
   */
  async getSpeechAnalyses(speechId: string) {
    return this.aiAnalysisModel.find({ speech_id: speechId })
      .sort({ createdAt: 'desc' })
      .exec();
  }

  /**
   * 获取AI分析详情
   */
  async getAnalysisDetail(id: string) {
    return this.aiAnalysisModel.findById(id).exec();
  }
}
