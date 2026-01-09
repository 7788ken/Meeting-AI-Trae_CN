import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';

@Module({
  providers: [
    {
      provide: 'TRANSCRIPT_ENDPOINT',
      useValue: process.env.TRANSCRIPT_ENDPOINT,
    },
    {
      provide: 'TRANSCRIPT_APP_KEY',
      useValue: process.env.TRANSCRIPT_APP_KEY,
    },
    {
      provide: 'TRANSCRIPT_ACCESS_KEY',
      useValue: process.env.TRANSCRIPT_ACCESS_KEY,
    },
    {
      provide: 'TRANSCRIPT_RESOURCE_ID',
      useValue: process.env.TRANSCRIPT_RESOURCE_ID,
    },
    SpeechToTextService,
  ],
  exports: [SpeechToTextService],
})
export class SpeechToTextModule {}
