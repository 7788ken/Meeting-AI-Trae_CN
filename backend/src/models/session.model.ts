import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ collection: 'sessions', timestamps: true })
export class Session {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: 'medium' })
  recording_quality: string;

  @Prop({ default: 'zh-CN' })
  transcription_language: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  started_at: Date;

  @Prop()
  ended_at: Date;

  @Prop()
  duration: number;

  @Prop({ default: 0 })
  speakers_count: number;

  @Prop({ default: 0 })
  speeches_count: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);