import apiRequest from './index'
import type { Meeting } from '../stores/meeting'

interface CreateMeetingDto {
  name: string
  recording_quality: string
  transcription_language: string
}

export const meetingApi = {
  /**
   * 创建会议
   */
  createMeeting: async (data: CreateMeetingDto) => {
    const response = await apiRequest.post<Meeting>('/sessions', data)
    return response.data
  },
  
  /**
   * 获取会议列表
   */
  getMeetingList: async (params?: {
    page?: number
    page_size?: number
    status?: 'active' | 'ended'
    keyword?: string
  }) => {
    const response = await apiRequest.get<{ total: number; page: number; page_size: number; data: Meeting[] }>('/sessions', { params })
    return response.data
  },
  
  /**
   * 获取会议详情
   */
  getMeetingDetail: async (id: string) => {
    const response = await apiRequest.get<Meeting>(`/sessions/${id}`)
    return response.data
  },
  
  /**
   * 结束会议
   */
  endMeeting: async (id: string) => {
    const response = await apiRequest.post<Meeting>(`/sessions/${id}/end`)
    return response.data
  }
}
