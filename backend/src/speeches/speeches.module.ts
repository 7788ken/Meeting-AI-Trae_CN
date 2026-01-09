import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeechesService } from './speeches.service';
import { Speech, SpeechSchema } from '../models/speech.model';
import { AIAnalysis, AIAnalysisSchema } from '../models/ai-analysis.model';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Speech.name, schema: SpeechSchema },
      { name: AIAnalysis.name, schema: AIAnalysisSchema }
    ]),
    AiModule
  ],
  providers: [SpeechesService]
})
export class SpeechesModule {}
