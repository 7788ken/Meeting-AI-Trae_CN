import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { SpeechToTextModule } from '../speech-to-text/speech-to-text.module';

@Module({
  imports: [SpeechToTextModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
