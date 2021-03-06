require('dotenv').config();
import { HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SendparcelService } from './sendparcel.service';
import { nanoid } from 'nanoid';

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
      const cart = await service.getCartItems();
      expect(cart.status).toBe(true);
      expect(cart.message).toBe('success');
      expect(cart).toHaveProperty('data');
    });
  });

  describe('Get shipment status', () => {
    it('should return shipment status', async () => {
      const shipment = await service.getShipmentStatus();
      expect(shipment.status).toBe(true);
      expect(shipment.message).toBe('success');
      expect(shipment).toHaveProperty('data');
    });
  });

  describe('Get shipments', () => {
    it('should return shipment for single item', async () => {
      const singleItem = ['5be39a53015bde092b44373bab440348'];

      const shipment = await service.getShipments({
        shipment_keys: singleItem,
      });
      expect(shipment.status).toBe(true);
      expect(shipment.message).toBe('success');
      expect(shipment).toHaveProperty('data');
      expect(shipment.data).toHaveProperty(singleItem[0]);
    });

    it('should return shipment for multiple items', async () => {
      const multipleItems = [
        '5be39a53015bde092b44373bab440348',
        '8fce7705896f1dbfdf3e21b5fc1ff390',
      ];

      const shipment = await service.getShipments({
        shipment_keys: multipleItems,
      });
      expect(shipment.status).toBe(true);
      expect(shipment.message).toBe('success');
      expect(shipment).toHaveProperty('data');
      expect(shipment.data).toHaveProperty(multipleItems[0]);
      expect(shipment.data).toHaveProperty(multipleItems[1]);
    });
  });

  describe('Get shipment history', () => {
    it('should return shipment history', async () => {
      const shipment = await service.getShipmentHistory();
      expect(shipment.status).toBe(true);
      expect(shipment.message).toBe('success');
      expect(shipment).toHaveProperty('data');
      expect(shipment.data).toHaveProperty('shipments');
    });
  });

  describe('Check price bulk', () => {
    it('should return price bulk detail for single item', async () => {
      const priceBulk = await service.checkPriceBulk({
        shipments: [
          {
            sender_postcode: '53000',
            receiver_postcode: '55100',
            receiver_country_code: 'MY',
            declared_weight: '0.1',
          },
        ],
      });
      expect(priceBulk.status).toBe(true);
      expect(priceBulk.message).toBe('success');
      expect(priceBulk).toHaveProperty('data');
      expect(priceBulk.data).toHaveLength(1);
      expect(priceBulk.data[0].status).toBe(true);
      expect(priceBulk.data[0].message).toBe('success');
    });

    it('should return price bulk detail for multiple items', async () => {
      const priceBulk = await service.checkPriceBulk({
        shipments: [
          {
            sender_postcode: '53000',
            receiver_postcode: '55100',
            receiver_country_code: 'MY',
            declared_weight: '0.1',
          },
          {
            sender_postcode: '55100',
            receiver_postcode: '08000',
            receiver_country_code: 'MY',
            declared_weight: '0.1',
          },
        ],
      });
      expect(priceBulk.status).toBe(true);
      expect(priceBulk.message).toBe('success');
      expect(priceBulk).toHaveProperty('data');
      expect(priceBulk.data).toHaveLength(2);
      expect(priceBulk.data[0].status).toBe(true);
      expect(priceBulk.data[0].message).toBe('success');
      expect(priceBulk.data[1].status).toBe(true);
      expect(priceBulk.data[1].message).toBe('success');
    });
  });

  describe('Create awb bulk and bulk tracking no', () => {
    const orderId = nanoid();
    const orderId2 = nanoid();
    const orderId3 = nanoid();

    it('should return awb detail for single item', async () => {
      // Override timeout jest
      jest.setTimeout(30000);

      const awbBulk = await service.createBulkAwb({
        shipments: [
          {
            integration_order_id: orderId,
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
          },
        ],
      });
      expect(awbBulk.status).toBe(true);
      expect(awbBulk.message).toBe('success');
      expect(awbBulk).toHaveProperty('data');
      expect(awbBulk.data.tracking_no).toHaveLength(1);
      expect(awbBulk.data.tracking_no[0].integration_order_id).toBe(orderId);
    });

    it('should return awb bulk detail for multiple items', async () => {
      // Override timeout jest
      jest.setTimeout(30000);

      const awbBulk = await service.createBulkAwb({
        shipments: [
          {
            integration_order_id: orderId2,
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
          },
          {
            integration_order_id: orderId3,
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
          },
        ],
      });
      expect(awbBulk.status).toBe(true);
      expect(awbBulk.message).toBe('success');
      expect(awbBulk).toHaveProperty('data');
      expect(awbBulk.data.tracking_no).toHaveLength(2);
      expect(awbBulk.data.tracking_no[0].integration_order_id).toBe(orderId2);
      expect(awbBulk.data.tracking_no[1].integration_order_id).toBe(orderId3);
    });

    it('should return tracking detail for single item', async () => {
      const tracking = await service.getBulkTrackingNo({
        integration_order_id: [orderId],
      });
      expect(tracking.status).toBe(true);
      expect(tracking.message).toBe('success');
      expect(tracking).toHaveProperty('data');
      expect(tracking.data.tracking_no).toHaveLength(1);
      expect(tracking.data.tracking_no[0].integration_order_id).toBe(orderId);
    });

    it('should return tracking detail for multiple items', async () => {
      const tracking = await service.getBulkTrackingNo({
        integration_order_id: [orderId2, orderId3],
      });
      expect(tracking.status).toBe(true);
      expect(tracking.message).toBe('success');
      expect(tracking).toHaveProperty('data');
      expect(tracking.data.tracking_no).toHaveLength(2);
    });
  });
});
