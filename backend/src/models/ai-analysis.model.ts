import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AIAnalysisDocument = AIAnalysis & Document;

@Schema({
  timestamps: true,
})
export class AIAnalysis {
  @Prop({
    required: true,
  })
  speech_id: string;

  @Prop({
    required: true,
  })
  session_id: string;

  @Prop({
    required: true,
  })
  model_name: string;

  @Prop()
  core_analysis: string;

  @Prop()
  brief_answer: string;

  @Prop()
  deep_answer: string;

  @Prop()
  prompt: string;

  @Prop({
    default: 0,
  })
  tokens_used: number;

  @Prop({
    default: 0,
  })
  confidence: number;

  @Prop({
    type: Object,
    default: {},
  })
  metadata: Record<string, any>;
}

export const AIAnalysisSchema = SchemaFactory.createForClass(AIAnalysis);
