import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
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
    
    // 创建语音识别流，传递客户端ID
    const speechStream = await this.speechToTextService.createSpeechRecognitionStream(
      client.id,
      (result: any) => {
        // 向会话中的所有客户端发送转写结果
        this.logger.log(`Sending transcription to session ${payload.session_id}: ${JSON.stringify(result)}`);
        this.server.to(`session_${payload.session_id}`).emit('transcription', result);
        
        // 同时也直接发送给客户端，确保客户端能够收到
        client.emit('transcription', result);
        this.logger.log(`Directly sent transcription to client ${client.id}: ${JSON.stringify(result)}`);
      }
    );

    this.clientStreams.set(client.id, { 
      stream: speechStream, 
      sessionId: payload.session_id 
    });
    
    return { status: 'ok', message: 'Recording started' };
  }

  @SubscribeMessage('stop_recording')
  handleStopRecording(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} stopped recording`);
    
    // 结束语音识别流
    const streamInfo = this.clientStreams.get(client.id);
    if (streamInfo) {
      streamInfo.stream?.end();
      this.clientStreams.delete(client.id);
      
      // 关闭客户端的WebSocket连接
      this.speechToTextService.closeClientWebSocket(client.id);
    }
    
    return { status: 'ok', message: 'Recording stopped' };
  }

  @SubscribeMessage('audio_chunk')
  handleAudioChunk(client: Socket, @MessageBody() payload: { chunk: any }) {
    // 将音频数据写入语音识别流
    const streamInfo = this.clientStreams.get(client.id);
    if (streamInfo && streamInfo.stream) {
      // 将数组转换为Buffer
      const audioBuffer = Buffer.from(payload.chunk);
      this.logger.log(`Received audio chunk from client ${client.id}: ${audioBuffer.length} bytes`);
      streamInfo.stream.write(audioBuffer);
    }
    
    // 不需要返回响应，因为我们会通过 'transcription' 事件实时发送结果
    return { status: 'ok' };
  }
}
