import apiRequest from './index'
import { Meeting } from '../stores/meeting'

interface CreateMeetingDto {
  name: string
  recording_quality: string
  transcription_language: string
}

export const meetingApi = {
  /**
   * 创建会议
   */
  createMeeting: (data: CreateMeetingDto) => {
    return apiRequest.post<Meeting>('/sessions', data)
  },
  
  /**
   * 获取会议列表
   */
  getMeetingList: (params?: {
    page?: number
    page_size?: number
    status?: 'active' | 'ended'
    keyword?: string
  }) => {
    return apiRequest.get<{ total: number; page: number; page_size: number; data: Meeting[] }>('/sessions', { params })
  },
  
  /**
   * 获取会议详情
   */
  getMeetingDetail: (id: string) => {
    return apiRequest.get<Meeting>(`/sessions/${id}`)
  },
  
  /**
   * 结束会议
   */
  endMeeting: (id: string) => {
    return apiRequest.post<Meeting>(`/sessions/${id}/end`)
  }
}
