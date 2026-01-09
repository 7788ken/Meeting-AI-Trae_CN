import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private socketMap: Map<string, Socket> = new Map();

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.socketMap.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.socketMap.delete(client.id);
  }

  /**
   * 处理客户端发送的音频流数据
   */
  @SubscribeMessage('audioStream')
  handleAudioStream(client: Socket, data: {
    sessionId: string;
    audioChunk: Buffer;
  }) {
    // 这里将在后续实现语音转写处理逻辑
    // 暂时模拟返回转写结果
    const mockTranscription = {
      speaker: '发言者1',
      content: '这是一段模拟的语音转写结果',
      timestamp: new Date().toISOString(),
      confidence: 0.95,
    };

    client.emit('transcriptionResult', mockTranscription);
  }

  /**
   * 处理客户端发送的开始录音请求
   */
  @SubscribeMessage('startRecording')
  handleStartRecording(client: Socket, data: {
    sessionId: string;
  }) {
    console.log(`Start recording for session: ${data.sessionId}`);
    // 这里将在后续实现开始录音的处理逻辑
    client.emit('recordingStarted', { sessionId: data.sessionId });
  }

  /**
   * 处理客户端发送的停止录音请求
   */
  @SubscribeMessage('stopRecording')
  handleStopRecording(client: Socket, data: {
    sessionId: string;
  }) {
    console.log(`Stop recording for session: ${data.sessionId}`);
    // 这里将在后续实现停止录音的处理逻辑
    client.emit('recordingStopped', { sessionId: data.sessionId });
  }
}
