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

  describe('Get postcode details', () => {
    it('should return postcode details', async () => {
      const postcode = await service.getPostcodeDetails({ postcode: '08000' });
      expect(postcode.status).toBe(true);
      expect(postcode.message).toBe('success');
      expect(postcode.data.city).toBe('Sungai Petani');
    });

    it('should return invalid postcode error', async () => {
      const postcode = await service.getPostcodeDetails({ postcode: '0' });
      expect(postcode.status).toBe(false);
      expect(postcode.message).toBe('Missing [postcode] parameter/value');
    });
  });

  describe('Check price', () => {
    it('should return prices details', async () => {
      const prices = await service.checkPrice({
        sender_postcode: '55100',
        receiver_postcode: '08000',
        receiver_country_code: 'MY',
        declared_weight: '0.1',
      });
      expect(prices.status).toBe(true);
      expect(prices.message).toBe('success');
      expect(prices).toHaveProperty('data');
      expect(prices.data).toHaveProperty('prices');
    });

    it('should return invalid postcode error', async () => {
      const prices = await service.checkPrice({
        sender_postcode: '551001',
        receiver_postcode: '08000',
        receiver_country_code: 'MY',
        declared_weight: '0.1',
      });
      expect(prices.status).toBe(false);
      expect(prices.message).toBe(
        'Invalid [sender_postcode]. "551001" does not exist',
      );
    });
  });

  describe('Get parcel sizes', () => {
    it('should return parcel sizes', async () => {
      const parcels = await service.getParcelSizes();
      expect(parcels.status).toBe(true);
      expect(parcels.message).toBe('success');
      expect(parcels).toHaveProperty('data');
      expect(parcels.data).toHaveProperty('flyers_s');
    });
  });

  describe('Get content types', () => {
    it('should return content types', async () => {
      const parcels = await service.getContentTypes();
      expect(parcels.status).toBe(true);
      expect(parcels.message).toBe('success');
      expect(parcels).toHaveProperty('data');
      expect(parcels.data).toHaveProperty('outdoors');
    });
  });
});
