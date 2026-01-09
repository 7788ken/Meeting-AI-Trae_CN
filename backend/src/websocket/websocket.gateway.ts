import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SpeechToTextService } from '../speech-to-text/speech-to-text.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(WebsocketGateway.name);
  private clientStreams = new Map<string, { stream: any; sessionId: string }>();

  constructor(private speechToTextService: SpeechToTextService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { message: 'Connected to WebSocket server' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // 清理客户端流
    const streamInfo = this.clientStreams.get(client.id);
    if (streamInfo) {
      streamInfo.stream?.end();
      this.clientStreams.delete(client.id);
    }
  }

  @SubscribeMessage('join_session')
  handleJoinSession(client: Socket, payload: { session_id: string }) {
    this.logger.log(`Client ${client.id} joined session: ${payload.session_id}`);
    client.join(`session_${payload.session_id}`);
    return { status: 'ok', message: `Joined session ${payload.session_id}` };
  }

  @SubscribeMessage('start_recording')
  async handleStartRecording(client: Socket, payload: { session_id: string }) {
    this.logger.log(`Client ${client.id} started recording for session: ${payload.session_id}`);
    
    // 创建语音识别流
    const speechStream = await this.speechToTextService.createSpeechRecognitionStream(
      (result: any) => {
        // 向会话中的所有客户端发送转写结果
        this.server.to(`session_${payload.session_id}`).emit('transcription', result);
      }
    );

    this.clientStreams.set(client.id, { 
      stream: speechStream, 
      sessionId: payload.session_id 
    });
    
    return { status: 'ok', message: 'Recording started' };
  }

  @SubscribeMessage('stop_recording')
  handleStopRecording(client: Socket) {
    this.logger.log(`Client ${client.id} stopped recording`);
    
    // 结束语音识别流
    const streamInfo = this.clientStreams.get(client.id);
    if (streamInfo) {
      streamInfo.stream?.end();
      this.clientStreams.delete(client.id);
    }
    
    return { status: 'ok', message: 'Recording stopped' };
  }

  @SubscribeMessage('audio_chunk')
  handleAudioChunk(client: Socket, @MessageBody() payload: { chunk: Buffer }) {
    // 将音频数据写入语音识别流
    const streamInfo = this.clientStreams.get(client.id);
    if (streamInfo && streamInfo.stream) {
      streamInfo.stream.write(payload.chunk);
    }
    
    // 不需要返回响应，因为我们会通过 'transcription' 事件实时发送结果
    return { status: 'ok' };
  }
}
