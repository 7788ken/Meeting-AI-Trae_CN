import { defineStore } from 'pinia'

export interface Speech {
  id: string
  speaker: string
  content: string
  startTime: string
  endTime: string
  confidence: number
  color: string
}

export interface AIAnalysis {
  coreAnalysis: string
  briefAnswer: string
  deepAnswer: string
}

export interface TranscriptionState {
  transcriptions: Speech[]
  currentAIResult: AIAnalysis | null
  selectedSpeech: Speech | null
}

export const useTranscriptionStore = defineStore('transcription', {
  state: (): TranscriptionState => ({
    transcriptions: [],
    currentAIResult: null,
    selectedSpeech: null
  }),
  
  actions: {
    addTranscription(speech: Speech) {
      this.transcriptions.push(speech)
    },
    
    clearTranscriptions() {
      this.transcriptions = []
      this.currentAIResult = null
      this.selectedSpeech = null
    },
    
    setSelectedSpeech(speech: Speech | null) {
      this.selectedSpeech = speech
      if (speech) {
        this.currentAIResult = null
      }
    },
    
    setAIResult(result: AIAnalysis) {
      this.currentAIResult = result
    }
  }
})
