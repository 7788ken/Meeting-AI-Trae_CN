export class AudioCaptureService {
  private audioStream: MediaStream | null = null
  private socket: any = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array | null = null
  private animationFrameId: number | null = null
  private scriptProcessor: ScriptProcessorNode | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private isCapturing: boolean = false
  
  /**
   * 初始化音频捕获服务
   */
  constructor(socket: any) {
    this.socket = socket
  }
  
  /**
   * 请求麦克风权限并开始捕获音频
   */
  async startCapture(onData?: (data: Uint8Array, volume: number) => void): Promise<MediaStream> {
    try {
      console.log('开始请求麦克风权限...')
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
      
      console.log('麦克风权限已获取，音频流:', this.audioStream)
      
      // 初始化音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      })
      
      // 创建音频源
      this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream)
      
      // 创建脚本处理器，用于处理音频数据
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1)
      
      // 连接音频源到脚本处理器
      this.sourceNode.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)
      
      console.log('音频处理管道已初始化')
      
      // 处理音频数据
      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isCapturing) return
        
        console.log('检测到音频数据')
        
        // 获取输入音频数据（单声道）
        const inputData = event.inputBuffer.getChannelData(0)
        
        // 检测是否有声音（简单的音量检测）
        const volume = this.calculateVolume(inputData)
        console.log('原始音频音量:', volume)
        
        // 音量放大倍数
        const volumeGain = 5.0
        
        // 将Float32Array转换为Int16Array，并应用音量放大
        const int16Array = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          // 应用音量放大，添加null/undefined检查
          const inputSample = inputData[i] || 0
          let sample = inputSample * volumeGain
          // 限制范围在[-1, 1]之间
          sample = Math.max(-1, Math.min(1, sample))
          // 将[-1, 1]范围的float转换为[-32768, 32767]范围的int16
          int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
        }
        
        // 计算放大后的音量
        const amplifiedVolume = this.calculateVolume(new Float32Array(int16Array.buffer))
        console.log('放大后音频音量:', amplifiedVolume)
        
        // 转换为Uint8Array以便发送
        const uint8Array = new Uint8Array(int16Array.buffer)
        
        // 发送音频数据到Socket.io
        if (this.socket && this.socket.connected) {
          console.log('发送音频数据到后端:', uint8Array.length, '字节')
          this.socket.emit('audio_chunk', { chunk: Array.from(uint8Array) })
        } else {
          console.error('Socket未连接，无法发送音频数据')
        }
        
        // 调用回调函数，用于音频可视化和音量检测
        if (onData) {
          onData(uint8Array, volume)
        }
      }
      
      // 初始化音频分析器，用于音频可视化
      this.initAudioAnalyser()
      
      this.isCapturing = true
      console.log('音频捕获已开始')
      return this.audioStream
    } catch (error) {
      console.error('音频捕获失败:', error)
      throw error
    }
  }

  /**
   * 计算音频音量
   */
  private calculateVolume(data: Float32Array): number {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const sample = data[i] || 0
      sum += sample * sample
    }
    const rms = Math.sqrt(sum / data.length)
    return rms
  }
  
  /**
   * 停止音频捕获
   */
  stopCapture(): void {
    this.isCapturing = false
    
    // 清理脚本处理器
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
      this.scriptProcessor = null
    }
    
    // 清理音频源
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }
    
    // 停止所有音频轨道
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    
    // 清理音频分析器
    this.cleanupAudioAnalyser()
    
    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
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
      this.dataArray = new Uint8Array(bufferLength)
    } catch (error) {
      console.error('初始化音频分析器失败:', error)
    }
  }
  
  /**
   * 获取音频频谱数据，用于可视化
   */
  getAudioData(): Uint8Array | null {
    if (this.analyser && this.dataArray) {
      // 修复类型兼容性问题
      this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>)
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
