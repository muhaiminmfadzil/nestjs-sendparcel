require('dotenv').config();
import { HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SendparcelService } from './sendparcel.service';

const { APIKEY } = process.env;

describe('Sendparcel Service', () => {
  let service: SendparcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SendparcelService,
          useValue: new SendparcelService(new HttpService(), {
            apiKey: APIKEY,
            demo: true,
          }),
        },
      ],
    }).compile();

    service = module.get<SendparcelService>(SendparcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get me details', () => {
    it('should return me details', async () => {
      const me = await service.me();
      expect(me.status).toBe(true);
      expect(me.message).toBe('success');
    });
  });
});