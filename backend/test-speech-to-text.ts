import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SpeechToTextService } from './src/speech-to-text/speech-to-text.service';

async function testSpeechToText() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const speechToTextService = app.get(SpeechToTextService);
  
  // 测试文件方式的语音转写
  try {
    const result = await speechToTextService.speechToText({
      audio_url: 'https://example.com/audio.mp3',
      language: 'zh-CN',
      service: 'volcengine'
    });
    console.log('语音转写结果:', result);
  } catch (error) {
    console.error('语音转写失败:', error);
  }
  
  await app.close();
}

testSpeechToText();
