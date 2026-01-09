import apiRequest from './index'
import { AIAnalysis } from '../stores/transcription'

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
  analyzeSpeech: (speechId: string, data: AnalyzeSpeechDto) => {
    return apiRequest.post<AIAnalysis>(`/speeches/${speechId}/analyze`, data)
  },
  
  /**
   * 获取发言的AI分析列表
   */
  getAnalysisList: (speechId: string) => {
    return apiRequest.get<AIAnalysis[]>(`/speeches/${speechId}/analyses`)
  },
  
  /**
   * 获取支持的AI模型列表
   */
  getAIModels: () => {
    return apiRequest.get<AIModel[]>('/ai/models')
  }
}
