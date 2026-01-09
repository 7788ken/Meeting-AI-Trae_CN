import { Module } from '@nestjs/common';
import { SpeechProcessingService } from './speech-processing.service';

@Module({
  providers: [SpeechProcessingService]
})
export class SpeechProcessingModule {}
