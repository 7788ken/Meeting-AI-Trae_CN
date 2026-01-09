import apiRequest from './index'
import type { AIAnalysis } from '../stores/transcription'

interface AnalyzeSpeechDto {
  model_name: string
  prompt: string
}

export interface AIModel {
  name: string
  display_name: string
  description: string
  is_default: boolean
  cost_per_1k_tokens: number
}

export const aiApi = {
  /**
   * 生成AI分析
   */
  analyzeSpeech: async (speechId: string, data: AnalyzeSpeechDto) => {
    return await apiRequest.post<AIAnalysis>(`/speeches/${speechId}/analyze`, data)
  },
  
  /**
   * 获取发言的AI分析列表
   */
  getAnalysisList: async (speechId: string) => {
    return await apiRequest.get<AIAnalysis[]>(`/speeches/${speechId}/analyses`)
  },
  
  /**
   * 获取支持的AI模型列表
   */
  getAIModels: async () => {
    return await apiRequest.get<AIModel[]>('/ai/models')
  }
}
