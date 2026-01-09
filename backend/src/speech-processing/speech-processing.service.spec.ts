import { Test, TestingModule } from '@nestjs/testing';
import { SpeechProcessingService } from './speech-processing.service';

describe('SpeechProcessingService', () => {
  let service: SpeechProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeechProcessingService],
    }).compile();

    service = module.get<SpeechProcessingService>(SpeechProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
