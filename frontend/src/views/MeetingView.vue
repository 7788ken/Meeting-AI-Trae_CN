<template>
  <div class="meeting">
    <div class="meeting-header">
      <h1>会议：{{ meetingName }}</h1>
      <div class="meeting-controls">
        <el-button type="success" @click="toggleRecording" :disabled="isRecordingDisabled">
          <span v-if="isRecording" class="recording-indicator">
            <span class="microphone-icon" :class="{ 'recording': isRecording, 'voice-detected': isVoiceDetected }">🎤</span>
          </span>
          {{ isRecording ? '停止录音' : '开始录音' }}
        </el-button>
        <el-button type="danger" @click="endMeeting">结束会议</el-button>
      </div>
    </div>
    
    <div class="meeting-content">
      <div class="transcription-area">
        <h2>实时转写</h2>
        <div class="transcription-container" ref="transcriptionContainer">
          <el-skeleton :rows="3" animated v-if="loading" />
          <div v-else-if="transcriptions.length === 0" class="empty-transcription">
            <p>暂无转写记录，点击开始录音开始会议</p>
          </div>
          <div v-for="speech in transcriptions" :key="speech.id" class="speech-item">
            <span :style="{ color: speech.color }" class="speaker-name">{{ speech.speaker }}：</span>
            <span class="speech-content">{{ speech.content }}</span>
            <el-button type="primary" size="small" @click="generateAIAnalysis(speech)">
              分析
            </el-button>
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
          
          <div class="ai-settings">
            <div class="ai-model-select">
              <span>AI模型：</span>
              <el-select v-model="selectedModel" placeholder="选择AI模型">
                <el-option
                  v-for="model in aiModels"
                  :key="model.name"
                  :label="model.display_name"
                  :value="model.name"
                />
              </el-select>
              <el-button type="primary" size="small" @click="generateAIAnalysis(selectedSpeech)" :disabled="!selectedSpeech">
                重新分析
              </el-button>
            </div>
          </div>
          
          <div v-if="aiResult" class="ai-result">
            <el-tabs v-model="analysisType" type="card">
              <el-tab-pane label="核心要点" name="coreAnalysis">
                <div class="analysis-content">
                  <h3>核心要点分析：</h3>
                  <p>{{ aiResult.coreAnalysis }}</p>
                </div>
              </el-tab-pane>
              <el-tab-pane label="简要回答" name="briefAnswer">
                <div class="analysis-content">
                  <h3>简要回答：</h3>
                  <p>{{ aiResult.briefAnswer }}</p>
                </div>
              </el-tab-pane>
              <el-tab-pane label="深度分析" name="deepAnswer">
                <div class="analysis-content">
                  <h3>深度分析：</h3>
                  <pre>{{ aiResult.deepAnswer }}</pre>
                </div>
              </el-tab-pane>
            </el-tabs>
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
import { useRouter } from 'vue-router'
import { useMeetingStore } from '../stores/meeting'
import { useTranscriptionStore } from '../stores/transcription'
import { meetingApi } from '../api/meeting'
import { aiApi } from '../api/ai'
import type { AIModel } from '../api/ai'
import type { Speech, AIAnalysis } from '../stores/transcription'
import { ElMessage } from 'element-plus'
import { AudioCaptureService } from '../services/audio-capture'
import { io, Socket } from 'socket.io-client'

const router = useRouter()
const meetingStore = useMeetingStore()
const transcriptionStore = useTranscriptionStore()

const props = defineProps<{
  id: string
}>()

const meetingName = ref('加载中...')
const isRecording = ref(false)
const isRecordingDisabled = ref(false)
const loading = ref(false)
const transcriptions = ref<Speech[]>([])
const showAIResult = ref(false)
const selectedSpeech = ref<Speech | null>(null)
const aiResult = ref<AIAnalysis | null>(null)
const socket = ref<Socket | null>(null)
const isConnected = ref(false)
const transcriptionContainer = ref<HTMLElement | null>(null)
const isVoiceDetected = ref(false)
const voiceDetectionTimeout = ref<number | null>(null)
// 用于跟踪用户是否手动滚动
const isUserScrolling = ref(false)

// 发言者颜色池
const speakerColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']
const speakerColorMap = new Map<string, string>()

// 获取会议详情
const fetchMeetingDetail = async () => {
  loading.value = true
  try {
    const meeting = await meetingApi.getMeetingDetail(props.id)
    meetingName.value = meeting.name
    meetingStore.setCurrentMeeting(meeting)
  } catch (error: any) {
    ElMessage.error(error.message || '获取会议详情失败')
    console.error('获取会议详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化Socket.io连接
const initWebSocket = () => {
  try {
    // 使用Socket.io连接到后端服务器，通过Vite代理
    socket.value = io('http://localhost:5102', {
      transports: ['websocket'],
      autoConnect: true
    })
    
    socket.value.on('connect', () => {
      console.log('Socket.io连接已建立')
      isConnected.value = true
      // 加入会话
      socket.value?.emit('join_session', { session_id: props.id })
    })
    
    socket.value.on('transcription', (result: any) => {
      console.log('Socket.io消息:', result)
      
      // 直接在控制台显示接收到的转写结果，便于调试
      console.log('接收到转写结果:', result.text)
      
      // 为发言者分配颜色
      if (!speakerColorMap.has(result.speaker)) {
        const colorIndex = speakerColorMap.size % speakerColors.length
        speakerColorMap.set(result.speaker, speakerColors[colorIndex] || '#1890ff')
      }
      
      // 更新转写记录
      const transcription = {
        id: Date.now().toString(),
        speaker: result.speaker,
        content: result.text,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        confidence: result.confidence,
        color: speakerColorMap.get(result.speaker) || '#1890ff'
      }
      
      console.log('将转写结果添加到数组:', transcription)
      transcriptions.value.push(transcription)
      transcriptionStore.addTranscription(transcription)
      console.log('当前转写记录数量:', transcriptions.value.length)
      
      // 自动滚动到底部
      scrollToBottom()
    })
    
    socket.value.on('disconnect', () => {
      console.log('Socket.io连接已关闭')
      isConnected.value = false
    })
    
    socket.value.on('connect_error', (error: any) => {
      console.error('Socket.io连接错误:', error)
      isConnected.value = false
    })
  } catch (error) {
    console.error('初始化Socket.io连接失败:', error)
    isConnected.value = false
  }
}

// 音频捕获服务实例
const audioCaptureService = ref<AudioCaptureService | null>(null)

// 开始录音
const startRecording = async () => {
  if (!socket.value || !isConnected.value) {
    ElMessage.error('Socket.io连接未建立，无法开始录音')
    return
  }
  
  try {
    // 发送开始录音命令
    console.log('发送start_recording事件:', { session_id: props.id })
    socket.value.emit('start_recording', { session_id: props.id })
    
    // 初始化音频捕获服务
    audioCaptureService.value = new AudioCaptureService(socket.value)
    
    // 开始音频捕获，添加回调监听音频数据和音量
    await audioCaptureService.value.startCapture((audioData, volume) => {
      console.log('音频数据捕获成功:', audioData.length, '字节', '音量:', volume)
      
      // 语音检测：根据音量大小判断是否有语音活动
      // 音量阈值，超过这个值表示检测到语音
      const volumeThreshold = 0.01
      if (volume > volumeThreshold) {
        isVoiceDetected.value = true
        
        // 清除之前的超时，设置新的超时
        if (voiceDetectionTimeout.value) {
          clearTimeout(voiceDetectionTimeout.value)
        }
        // 500ms后恢复正常状态，使抖动效果更灵敏
        voiceDetectionTimeout.value = window.setTimeout(() => {
          isVoiceDetected.value = false
        }, 500)
      }
    })
    
    console.log('录音已开始，等待转写结果...')
    
    isRecording.value = true
    meetingStore.startRecording()
    
    ElMessage.success('录音已开始')
    console.log('开始录音完成')
  } catch (error: any) {
    ElMessage.error('获取麦克风权限失败或录音初始化失败')
    console.error('开始录音失败:', error)
    isRecording.value = false
  }
}

// 停止录音
const stopRecording = () => {
  if (audioCaptureService.value) {
    audioCaptureService.value.stopCapture()
    audioCaptureService.value = null
  }
  
  // 发送停止录音命令
  socket.value?.emit('stop_recording', { session_id: props.id })
  
  isRecording.value = false
  meetingStore.stopRecording()
  
  ElMessage.success('录音已停止')
  console.log('停止录音')
}

// 切换录音状态
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 结束会议
const endMeeting = async () => {
  try {
    await meetingApi.endMeeting(props.id)
    ElMessage.success('会议已结束')
    meetingStore.endMeeting()
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '结束会议失败')
    console.error('结束会议失败:', error)
  }
}

// AI模型相关状态
const aiModels = ref<AIModel[]>([])
const selectedModel = ref<string>('qianwen')
const analysisType = ref<string>('coreAnalysis') // coreAnalysis, briefAnswer, deepAnswer

// 获取支持的AI模型列表
const fetchAIModels = async () => {
  try {
    const models = await aiApi.getAIModels()
    aiModels.value = models
    // 设置默认模型
    const defaultModel = models.find((model) => model.is_default)
    if (defaultModel) {
      selectedModel.value = defaultModel.name
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取AI模型列表失败')
    console.error('获取AI模型列表失败:', error)
    // 使用默认模型列表
    aiModels.value = [
      { name: 'qianwen', display_name: '字节跳动千问', description: '字节跳动开发的大语言模型', is_default: true, cost_per_1k_tokens: 0.15 },
      { name: 'doubao', display_name: '豆包', description: '字节跳动开发的AI对话助手', is_default: false, cost_per_1k_tokens: 0.2 },
      { name: 'glm-4', display_name: '智谱GLM-4', description: '智谱AI开发的大语言模型', is_default: false, cost_per_1k_tokens: 0.2 },
      { name: 'minimax', display_name: 'MINIMAX', description: 'MINIMAX开发的大语言模型', is_default: false, cost_per_1k_tokens: 0.3 },
      { name: 'kimi', display_name: 'KIMI', description: '月之暗面开发的大语言模型', is_default: false, cost_per_1k_tokens: 0.4 },
      { name: 'dc', display_name: '深度求索', description: '深度求索开发的大语言模型', is_default: false, cost_per_1k_tokens: 0.5 }
    ]
  }
}

// 生成AI分析
const generateAIAnalysis = async (speech: Speech | null) => {
  if (!speech) return
  
  selectedSpeech.value = speech
  showAIResult.value = true
  aiResult.value = null
  analysisType.value = 'coreAnalysis'
  
  try {
    const analysis = await aiApi.analyzeSpeech(speech.id, {
      model_name: selectedModel.value,
      prompt: '请分析以下发言内容的核心要点、简要回答和深度分析：'
    })
    aiResult.value = analysis
    transcriptionStore.setAIResult(analysis)
  } catch (error: any) {
    ElMessage.error(error.message || '生成AI分析失败')
    console.error('生成AI分析失败:', error)
  }
}

// 自动滚动到底部
const scrollToBottom = () => {
  if (!transcriptionContainer.value) return
  
  // 如果用户没有手动滚动，自动滚动到底部
  if (!isUserScrolling.value) {
    setTimeout(() => {
      if (transcriptionContainer.value) {
        transcriptionContainer.value.scrollTop = transcriptionContainer.value.scrollHeight
      }
    }, 100)
  }
}

// 监听滚动事件，判断用户是否手动滚动
const handleScroll = () => {
  if (!transcriptionContainer.value) return
  
  const currentScrollTop = transcriptionContainer.value.scrollTop
  const scrollHeight = transcriptionContainer.value.scrollHeight
  const clientHeight = transcriptionContainer.value.clientHeight
  
  // 计算滚动到底部的阈值（10px内）
  const isAtBottom = scrollHeight - currentScrollTop - clientHeight < 10
  
  if (isAtBottom) {
    isUserScrolling.value = false
  } else {
    isUserScrolling.value = true
  }
}

// 页面加载时获取会议详情和初始化WebSocket连接
onMounted(() => {
  fetchMeetingDetail()
  initWebSocket()
  fetchAIModels()
  
  // 添加滚动事件监听
  if (transcriptionContainer.value) {
    transcriptionContainer.value.addEventListener('scroll', handleScroll)
  }
})

// 页面卸载前关闭WebSocket连接
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close()
  }
  
  // 停止录音
  if (isRecording.value) {
    stopRecording()
  }
  
  // 移除滚动事件监听
  if (transcriptionContainer.value) {
    transcriptionContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.meeting {
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
  height: calc(100vh - 150px);
}

.transcription-area,
.ai-analysis-area {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.transcription-container {
  flex: 1;
  overflow-y: auto;
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.speech-item {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  background: #f9f9f9;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.speaker-name {
  font-weight: bold;
  min-width: 80px;
}

.speech-content {
  flex: 1;
  word-wrap: break-word;
}

.empty-transcription {
  text-align: center;
  color: #999;
  padding: 50px 0;
}

.ai-prompt {
  text-align: center;
  color: #999;
  padding: 50px 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.selected-speech {
  margin-bottom: 20px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
}

.ai-settings {
  margin-bottom: 20px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.ai-model-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-result {
  margin-top: 10px;
}

.analysis-content {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ai-loading {
  margin-top: 10px;
}

/* 麦克风图标样式 */
.recording-indicator {
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
}

.microphone-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

/* 录音状态样式 */
.microphone-icon.recording {
  color: #f56c6c;
  animation: pulse 1s infinite;
}

/* 语音检测样式 */
.microphone-icon.voice-detected {
  color: #67c23a;
  animation: shake 0.5s ease-in-out;
}

/* 脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 抖动动画 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-5px);
  }
  40%, 80% {
    transform: translateX(5px);
  }
}
</style>