import { Module } from '@nestjs/common';
import { SpeechesService } from './speeches.service';

@Module({
  providers: [SpeechesService]
})
export class SpeechesModule {}
