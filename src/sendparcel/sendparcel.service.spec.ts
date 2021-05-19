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

  describe('Create shipment and checkout', () => {
    const singleShipmentKey: string[] = [];
    const multipleShipmentKey: string[] = [];

    it('should return shipment with success status', async () => {
      const shipment = await service.createShipment({
        send_method: 'dropoff',
        send_date: '2021-06-01',
        type: 'document',
        declared_weight: '0.1',
        size: 'flyers_l',
        provider_code: 'poslaju',
        content_type: 'general',
        content_description: 'DIY item',
        content_value: '15',
        sender_name: 'Muhaimin bin Mohd Fadzil',
        sender_phone: '0174170019',
        sender_email: 'muhaiminmfadzil@gmail.com',
        sender_address_line_1: 'Hello World',
        sender_postcode: '55100',
        receiver_name: 'Tun Mahathir 1',
        receiver_phone: '0199999999',
        receiver_email: 'tun@mahathir.com',
        receiver_address_line_1: 'Jabatan Perdana Menteri',
        receiver_address_line_2: 'Bulatan Utama Putrajaya',
        receiver_address_line_3: '',
        receiver_address_line_4: '',
        receiver_postcode: '62000',
        receiver_country_code: 'MY',
      });
      expect(shipment.status).toBe(true);
      expect(shipment.message).toBe('success');
      expect(shipment).toHaveProperty('data');
      expect(shipment.data.send_method).toBe('dropoff');
      // First data
      singleShipmentKey.push(shipment.data.key);
    });

    it('should return postcode error status', async () => {
      const shipment = await service.createShipment({
        send_method: 'dropoff',
        send_date: '2021-06-01',
        type: 'document',
        declared_weight: '0.1',
        size: 'flyers_l',
        provider_code: 'poslaju',
        content_type: 'general',
        content_description: 'DIY item',
        content_value: '15',
        sender_name: 'Muhaimin bin Mohd Fadzil',
        sender_phone: '0174170019',
        sender_email: 'muhaiminmfadzil@gmail.com',
        sender_address_line_1: 'Hello World',
        sender_postcode: '55100',
        receiver_name: 'Tun Mahathir',
        receiver_phone: '0199999999',
        receiver_email: 'tun@mahathir.com',
        receiver_address_line_1: 'Jabatan Perdana Menteri',
        receiver_address_line_2: 'Bulatan Utama Putrajaya',
        receiver_address_line_3: '',
        receiver_address_line_4: '',
        receiver_postcode: '620001',
        receiver_country_code: 'MY',
      });
      expect(shipment.status).toBe(false);
      expect(shipment.message).toBe(
        'Receiver Postcode [receiver_postcode] is invalid',
      );
    });

    it('should return single checkout details', async () => {
      // Override timeout jest
      jest.setTimeout(30000);

      const checkout = await service.checkout({
        shipment_keys: singleShipmentKey,
      });
      expect(checkout.status).toBe(true);
      expect(checkout.message).toBe('success');
      expect(checkout).toHaveProperty('data');
      expect(checkout.data.shipments[0].key).toBe(singleShipmentKey[0]);
    });

    it('should return multiple checkout details', async () => {
      // Override timeout jest
      jest.setTimeout(30000);

      // Create multiple shipments for testing
      const shipment1 = await service.createShipment({
        send_method: 'dropoff',
        send_date: '2021-06-01',
        type: 'document',
        declared_weight: '0.1',
        size: 'flyers_l',
        provider_code: 'poslaju',
        content_type: 'general',
        content_description: 'DIY item',
        content_value: '15',
        sender_name: 'Muhaimin bin Mohd Fadzil',
        sender_phone: '0174170019',
        sender_email: 'muhaiminmfadzil@gmail.com',
        sender_address_line_1: 'Hello World',
        sender_postcode: '55100',
        receiver_name: 'Tun Mahathir 2',
        receiver_phone: '0199999999',
        receiver_email: 'tun@mahathir.com',
        receiver_address_line_1: 'Jabatan Perdana Menteri',
        receiver_address_line_2: 'Bulatan Utama Putrajaya',
        receiver_address_line_3: '',
        receiver_address_line_4: '',
        receiver_postcode: '62000',
        receiver_country_code: 'MY',
      });
      const shipment2 = await service.createShipment({
        send_method: 'dropoff',
        send_date: '2021-06-01',
        type: 'document',
        declared_weight: '0.1',
        size: 'flyers_l',
        provider_code: 'poslaju',
        content_type: 'general',
        content_description: 'DIY item',
        content_value: '15',
        sender_name: 'Muhaimin bin Mohd Fadzil',
        sender_phone: '0174170019',
        sender_email: 'muhaiminmfadzil@gmail.com',
        sender_address_line_1: 'Hello World',
        sender_postcode: '55100',
        receiver_name: 'Tun Mahathir 3',
        receiver_phone: '0199999999',
        receiver_email: 'tun@mahathir.com',
        receiver_address_line_1: 'Jabatan Perdana Menteri',
        receiver_address_line_2: 'Bulatan Utama Putrajaya',
        receiver_address_line_3: '',
        receiver_address_line_4: '',
        receiver_postcode: '62000',
        receiver_country_code: 'MY',
      });
      // Get shipment keys
      multipleShipmentKey.push(shipment1.data.key);
      multipleShipmentKey.push(shipment2.data.key);

      // Checkout multiple keys
      const checkout = await service.checkout({
        shipment_keys: multipleShipmentKey,
      });
      expect(checkout.status).toBe(true);
      expect(checkout.message).toBe('success');
      expect(checkout).toHaveProperty('data');
    });
  });

  describe('Get cart items', () => {
    it('should return cart items', async () => {
      const parcels = await service.getCartItems();
      expect(parcels.status).toBe(true);
      expect(parcels.message).toBe('success');
      expect(parcels).toHaveProperty('data');
    });
  });
});
