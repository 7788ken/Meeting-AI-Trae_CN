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
    return await apiRequest.post<Meeting>('/sessions', data)
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
    return await apiRequest.get<{ total: number; page: number; page_size: number; data: Meeting[] }>('/sessions', { params })
  },
  
  /**
   * 获取会议详情
   */
  getMeetingDetail: async (id: string) => {
    return await apiRequest.get<Meeting>(`/sessions/${id}`)
  },
  
  /**
   * 结束会议
   */
  endMeeting: async (id: string) => {
    return await apiRequest.post<Meeting>(`/sessions/${id}/end`)
  }
}
