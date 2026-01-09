import { defineStore } from 'pinia'

export interface Meeting {
  id: string
  name: string
  status: 'active' | 'ended'
  createdAt: string
  recordingQuality: string
  transcriptionLanguage: string
}

export interface MeetingState {
  currentMeeting: Meeting | null
  isRecording: boolean
  meetings: Meeting[]
}

export const useMeetingStore = defineStore('meeting', {
  state: (): MeetingState => ({
    currentMeeting: null,
    isRecording: false,
    meetings: []
  }),
  
  actions: {
    setCurrentMeeting(meeting: Meeting) {
      this.currentMeeting = meeting
    },
    
    startRecording() {
      this.isRecording = true
    },
    
    stopRecording() {
      this.isRecording = false
    },
    
    endMeeting() {
      if (this.currentMeeting) {
        this.currentMeeting.status = 'ended'
        this.isRecording = false
      }
    },
    
    addMeeting(meeting: Meeting) {
      this.meetings.push(meeting)
    },
    
    clearCurrentMeeting() {
      this.currentMeeting = null
      this.isRecording = false
    }
  }
})
