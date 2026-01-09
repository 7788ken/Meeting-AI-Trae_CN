import { Injectable, Inject, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import WebSocket from 'ws';
import * as crypto from 'crypto';

@Injectable()
export class SpeechToTextService {
  private logger = new Logger(SpeechToTextService.name);
  // 每个客户端有自己的WebSocket连接，使用Map存储
  private clientWss = new Map<string, WebSocket>();
  private sequenceNumber = 0;

  constructor(
    @Inject('TRANSCRIPT_ENDPOINT') private readonly transcriptEndpoint: string,
    @Inject('TRANSCRIPT_APP_KEY') private readonly transcriptAppKey: string,
    @Inject('TRANSCRIPT_ACCESS_KEY') private readonly transcriptAccessKey: string,
    @Inject('TRANSCRIPT_RESOURCE_ID') private readonly transcriptResourceId: string,
  ) {}

  /**
   * 创建语音识别流
   */
  async createSpeechRecognitionStream(clientId: string, callback: (result: any) => void) {
    // 创建一个可写流，用于处理音频数据
    const writeStream = new Readable({
      read() {}
    });

    this.logger.log(`为客户端 ${clientId} 创建语音识别流，连接到火山引擎WebSocket服务`);
    
    try {
      // 创建WebSocket连接，使用HTTP头鉴权
      const ws = new WebSocket(this.transcriptEndpoint, {
        headers: {
          'X-Api-App-Key': this.transcriptAppKey,
          'X-Api-Access-Key': this.transcriptAccessKey,
          'X-Api-Resource-Id': this.transcriptResourceId,
          'X-Api-Connect-Id': clientId
        }
      });
      
      // 将WebSocket连接存储到Map中
      this.clientWss.set(clientId, ws);
      
      // WebSocket连接打开事件
      ws.on('open', () => {
        this.logger.log(`客户端 ${clientId} WebSocket连接已打开`);
        
        // 发送初始化参数
        const initParams = {
          format: "pcm",
          sample_rate: 16000,
          channel: 1,
          first_chunk: true,
          enable_voice_detection: true,
          model: "paraformer-v2"
        };
        
        this.logger.log(`客户端 ${clientId} 发送初始化参数:`, JSON.stringify(initParams));
        ws.send(JSON.stringify(initParams));
      });
      
      // 接收WebSocket消息
      ws.on('message', (data: any) => {
        this.logger.log(`客户端 ${clientId} 收到WebSocket消息:`, data.toString());
        
        try {
          const message = JSON.parse(data.toString());
          
          // 处理不同类型的消息
          if (message.type === 'recognition_result') {
            // 识别结果消息
            const result = {
              text: message.payload.text || '',
              speaker: `发言者${Math.floor(Math.random() * 2) + 1}`,
              confidence: message.payload.confidence || 0.9,
              timestamp: new Date().toISOString(),
              isFinal: message.payload.is_final || false
            };
            
            this.logger.log(`客户端 ${clientId} 处理识别结果:`, JSON.stringify(result));
            callback(result);
          } else if (message.type === 'error') {
            // 错误消息
            this.logger.error(`客户端 ${clientId} 识别服务错误:`, message.payload);
          } else if (message.type === 'voice_detection') {
            // 语音检测消息
            this.logger.log(`客户端 ${clientId} 语音检测结果:`, message.payload);
          }
        } catch (error) {
          this.logger.error(`客户端 ${clientId} 解析WebSocket消息失败:`, error);
        }
      });
      
      // WebSocket错误事件
      ws.on('error', (error) => {
        this.logger.error(`客户端 ${clientId} WebSocket错误:`, error);
      });
      
      // WebSocket关闭事件
      ws.on('close', (code, reason) => {
        this.logger.log(`客户端 ${clientId} WebSocket连接已关闭: ${code} ${reason}`);
        this.clientWss.delete(clientId);
      });
      
      // 处理音频数据
      writeStream.on('data', (audioChunk: Buffer) => {
        this.logger.log(`客户端 ${clientId} 接收到音频数据: ${audioChunk.length} 字节`);
        
        // 如果WebSocket连接已建立，发送音频数据
        if (ws.readyState === WebSocket.OPEN) {
          // 发送音频数据，使用base64编码
          const audioMessage = {
            type: 'audio_data',
            payload: {
              audio: audioChunk.toString('base64')
            }
          };
          
          try {
            ws.send(JSON.stringify(audioMessage));
            this.logger.log(`客户端 ${clientId} 音频数据已发送到识别服务`);
          } catch (error) {
            this.logger.error(`客户端 ${clientId} 发送音频数据失败:`, error);
          }
        } else {
          this.logger.error(`客户端 ${clientId} WebSocket未连接，无法发送音频数据`);
        }
      });
      
    } catch (error) {
      this.logger.error(`客户端 ${clientId} 创建WebSocket连接失败:`, error);
    }

    return writeStream;
  }
  
  /**
   * 关闭客户端的WebSocket连接
   */
  closeClientWebSocket(clientId: string) {
    const ws = this.clientWss.get(clientId);
    if (ws) {
      this.logger.log(`关闭客户端 ${clientId} 的WebSocket连接`);
      ws.close();
      this.clientWss.delete(clientId);
    }
  }
  


  /**
   * 语音转写处理（文件方式）
   */
  async speechToText(data: { audio_url: string; language: string; service: string }) {
    try {
      // 实现文件方式的语音转写
      const response = await fetch('https://openspeech.bytedance.com/api/v3/sauc/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-App-Key': this.transcriptAppKey,
          'X-Api-Access-Key': this.transcriptAccessKey,
          'X-Api-Resource-Id': this.transcriptResourceId
        },
        body: JSON.stringify({
          audio_url: data.audio_url,
          language: data.language,
          service: data.service
        })
      });
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        text: result.text,
        confidence: result.confidence,
        segments: result.segments
      };
    } catch (error) {
      this.logger.error('文件方式语音转写失败:', error);
      throw error;
    }
  }
}
