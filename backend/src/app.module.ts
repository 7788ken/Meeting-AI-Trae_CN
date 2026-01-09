import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionsModule } from './sessions/sessions.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SpeechProcessingModule } from './speech-processing/speech-processing.module';
import { AiModule } from './ai/ai.module';
import { SpeechesModule } from './speeches/speeches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_meeting_assistant'),
    SessionsModule,
    WebsocketModule,
    SpeechProcessingModule,
    AiModule,
    SpeechesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
