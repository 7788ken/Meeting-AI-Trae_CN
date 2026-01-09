import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpeechDocument = Speech & Document;

@Schema({
  timestamps: true,
})
export class Speech {
  @Prop({
    required: true,
  })
  session_id: string;

  @Prop({
    required: true,
  })
  speaker_id: string;

  @Prop({
    required: true,
  })
  speaker_name: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  start_time: Date;

  @Prop({
    required: true,
  })
  end_time: Date;

  @Prop({
    default: 0,
  })
  duration: number;

  @Prop({
    default: 0,
  })
  confidence: number;

  @Prop()
  audio_url: string;

  @Prop({
    type: Object,
    default: {},
  })
  metadata: Record<string, any>;

  @Prop({
    default: false,
  })
  is_edited: boolean;

  @Prop()
  edited_at: Date;
}

export const SpeechSchema = SchemaFactory.createForClass(Speech);
