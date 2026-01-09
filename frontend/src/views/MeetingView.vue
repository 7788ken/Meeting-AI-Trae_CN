<template>
  <div class="meeting">
    <div class="meeting-header">
      <h1>会议：{{ meetingName }}</h1>
      <div class="meeting-controls">
        <el-button type="success" @click="toggleRecording" :disabled="isRecordingDisabled">
          {{ isRecording ? '停止录音' : '开始录音' }}
        </el-button>
        <el-button type="danger" @click="endMeeting">结束会议</el-button>
      </div>
    </div>
    
    <div class="meeting-content">
      <div class="transcription-area">
        <h2>实时转写</h2>
        <div class="transcription-container">
          <div v-for="(speech, index) in transcriptions" :key="index" class="speech-item">
            <span :style="{ color: speech.color }" class="speaker-name">{{ speech.speaker }}：</span>
            <span class="speech-content">{{ speech.content }}</span>
            <el-button type="primary" size="small" @click="showAIResult = true; selectedSpeech = speech">分析</el-button>
          </div>
        </div>
      </div>
      
      <div class="ai-analysis-area">
        <h2>AI分析</h2>
        <div v-if="!showAIResult" class="ai-prompt">
          <p>点击上方发言旁边的"分析"按钮查看AI分析结果</p>
        </div>
        <el-dialog
          v-model="showAIResult"
          title="AI分析结果"
          width="800px"
        >
          <div v-if="selectedSpeech" class="selected-speech">
            <h3>{{ selectedSpeech.speaker }}的发言：</h3>
            <p>{{ selectedSpeech.content }}</p>
          </div>
          <div v-if="aiResult" class="ai-result">
            <h3>核心要点分析：</h3>
            <p>{{ aiResult.coreAnalysis }}</p>
            <h3>简要回答：</h3>
            <p>{{ aiResult.briefAnswer }}</p>
            <h3>深度回答：</h3>
            <p>{{ aiResult.deepAnswer }}</p>
          </div>
          <div v-else class="ai-loading">
            <el-skeleton :rows="6" animated />
          </div>
          <template #footer>
            <el-button @click="showAIResult = false">关闭</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  id: string
}>()

const meetingName = ref('示例会议')
const isRecording = ref(false)
const isRecordingDisabled = ref(false)
const transcriptions = ref([
  { speaker: '发言者1', content: '大家好，今天我们来讨论一下AI会议助手的功能需求。', color: '#1890ff' },
  { speaker: '发言者2', content: '我觉得实时转写功能非常重要，希望能够支持多种语言。', color: '#52c41a' }
])
const showAIResult = ref(false)
const selectedSpeech = ref<any>(null)
const aiResult = ref(null)

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  // 这里将在后续实现录音功能
  console.log('切换录音状态:', isRecording.value)
}

const endMeeting = () => {
  // 这里将在后续实现结束会议功能
  console.log('结束会议')
  window.location.href = '/'
}
</script>

<style scoped>
.meeting {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.meeting-controls {
  display: flex;
  gap: 10px;
}

.meeting-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.transcription-area {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.transcription-container {
  max-height: 500px;
  overflow-y: auto;
  margin-top: 10px;
}

.speech-item {
  margin: 10px 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.speaker-name {
  font-weight: bold;
  margin-right: 10px;
}

.speech-content {
  flex: 1;
  word-break: break-all;
}

.ai-analysis-area {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.ai-prompt {
  text-align: center;
  color: #999;
  margin-top: 20px;
}

.selected-speech {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.ai-result h3 {
  margin-top: 15px;
  margin-bottom: 5px;
  color: #333;
}

.ai-result p {
  margin-bottom: 15px;
  line-height: 1.6;
}

.ai-loading {
  margin: 20px 0;
}
</style>
