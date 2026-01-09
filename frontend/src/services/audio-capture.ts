export class AudioCaptureService {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private socket: WebSocket | null = null
  private chunks: Blob[] = []
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array<ArrayBuffer> | null = null
  private animationFrameId: number | null = null
  
  /**
   * 初始化音频捕获服务
   */
  constructor(socket: WebSocket) {
    this.socket = socket
  }
  
  /**
   * 请求麦克风权限并开始捕获音频
   */
  async startCapture(onData?: (data: Uint8Array) => void): Promise<MediaStream> {
    try {
      // 请求麦克风权限
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000, 
          channelCount: 1, 
          sampleSize: 16, 
          echoCancellation: true, 
          noiseSuppression: true 
        } 
      })
      
      // 创建MediaRecorder实例
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      // 处理音频数据
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data)
          
          // 将音频数据转换为ArrayBuffer并发送到WebSocket
          const reader = new FileReader()
          reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer
            const uint8Array = new Uint8Array(arrayBuffer)
            
            // 发送音频数据到WebSocket
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              this.socket.send(JSON.stringify({
                type: 'audio_chunk',
                payload: { chunk: Array.from(uint8Array) }
              }))
            }
            
            // 调用回调函数，用于音频可视化
            if (onData) {
              onData(uint8Array)
            }
          }
          reader.readAsArrayBuffer(event.data)
        }
      }
      
      // 开始录制，每100ms发送一次数据
      this.mediaRecorder.start(100)
      
      // 初始化音频分析器，用于音频可视化
      this.initAudioAnalyser()
      
      return this.audioStream
    } catch (error) {
      console.error('音频捕获失败:', error)
      throw error
    }
  }
  
  /**
   * 停止音频捕获
   */
  stopCapture(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    
    if (this.audioStream) {
      // 停止所有音频轨道
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    
    // 清理音频分析器
    this.cleanupAudioAnalyser()
  }
  
  /**
   * 初始化音频分析器，用于音频可视化
   */
  private initAudioAnalyser(): void {
    if (!this.audioStream) return
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      
      // 将音频流连接到分析器
      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      source.connect(this.analyser)
      
      // 配置分析器
      this.analyser.fftSize = 256
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength) as unknown as Uint8Array<ArrayBuffer>
    } catch (error) {
      console.error('初始化音频分析器失败:', error)
    }
  }
  
  /**
   * 获取音频频谱数据，用于可视化
   */
  getAudioData(): Uint8Array | null {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray)
      return this.dataArray
    }
    return null
  }
  
  /**
   * 清理音频分析器
   */
  private cleanupAudioAnalyser(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    
    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.dataArray = null
  }
}
