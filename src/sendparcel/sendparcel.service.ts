import { HttpService, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CheckPriceDto } from './dto/check-price.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { GetPostcodeDetailsDto } from './dto/get-postcode-details.dto';
import { GetShipmentsDto } from './dto/get-shipments.dto';
import {
  CONFIG_OPTIONS,
  SendparcelOptions,
  HttpMethod,
} from './sendparcel.definition';
const formurlencoded = require('form-urlencoded');
@Injectable()
export class SendparcelService {
  // Api endpoint
  private readonly demoUrl =
    'http://sendparcel-test.ap-southeast-1.elasticbeanstalk.com/apiv1/';
  private readonly liveUrl = 'https://sendparcel.poslaju.com.my/apiv1/';

  private demo: boolean;
  private apiKey: string;
  private logService?: LoggerService;
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CONFIG_OPTIONS) options: SendparcelOptions,
  ) {
    this.apiKey = options.apiKey;
    this.demo = options.demo || false;
    this.logService = options.logger;
    this.setBaseUrl();
  }

  private setBaseUrl() {
    if (this.demo === false) {
      this.baseUrl = this.liveUrl;
    } else {
      this.baseUrl = this.demoUrl;
    }
  }

  private getUrl(endpoint: string) {
    return `${this.baseUrl}${endpoint}`;
  }

  private getApiCaller(httpMethod: HttpMethod, endpoint: string) {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const url = this.getUrl(endpoint);

    const handleResponse = (response) => {
      return response.data;
    };

    const handlerError = (error) => {
      throw error;
    };

    if (httpMethod === HttpMethod.GET) {
      return (options = {}) => {
        return this.httpService
          .get(url, { ...options, headers })
          .toPromise()
          .then(handleResponse)
          .catch(handlerError);
      };
    }

    if (httpMethod === HttpMethod.DELETE) {
      return (data = {}, options = {}) => {
        return this.httpService
          .delete(url, { ...options, headers })
          .toPromise()
          .then(handleResponse)
          .catch(handlerError);
      };
    }

    if (httpMethod === HttpMethod.POST) {
      return (data = {}, options = {}) => {
        const dataObj = { ...data, api_key: this.apiKey };
        const formData = formurlencoded(dataObj);

        return this.httpService
          .post(url, formData, { ...options, headers })
          .toPromise()
          .then(handleResponse)
          .catch(handlerError);
      };
    }

    if (httpMethod === HttpMethod.PUT) {
      return (data = {}, options = {}) => {
        const dataObj = { ...data, api_key: this.apiKey };
        const formData = formurlencoded(dataObj);

        return this.httpService
          .put(url, formData, { ...options, headers })
          .toPromise()
          .then(handleResponse)
          .catch(handlerError);
      };
    }

    if (httpMethod === HttpMethod.PATCH) {
      return (data = {}, options = {}) => {
        const dataObj = { ...data, api_key: this.apiKey };
        const formData = formurlencoded(dataObj);

        return this.httpService
          .patch(url, formData, { ...options, headers })
          .toPromise()
          .then(handleResponse)
          .catch(handlerError);
      };
    }
  }

  async me() {
    const api = this.getApiCaller(HttpMethod.POST, 'me');
    return await api();
  }

  async getPostcodeDetails(data: GetPostcodeDetailsDto) {
    const api = this.getApiCaller(HttpMethod.POST, 'get_postcode_details');
    return await api(data);
  }

  async checkPrice(data: CheckPriceDto) {
    const api = this.getApiCaller(HttpMethod.POST, 'check_price');
    return await api(data);
  }

  async getParcelSizes() {
    const api = this.getApiCaller(HttpMethod.POST, 'get_parcel_sizes');
    return await api();
  }

  async getContentTypes() {
    const api = this.getApiCaller(HttpMethod.POST, 'get_content_types');
    return await api();
  }

  async createShipment(data: CreateShipmentDto) {
    const api = this.getApiCaller(HttpMethod.POST, 'create_shipment');
    return await api(data);
  }

  async getCartItems() {
    const api = this.getApiCaller(HttpMethod.POST, 'get_cart_items');
    return await api();
  }

  async checkout(data: CheckoutDto) {
    const api = this.getApiCaller(HttpMethod.POST, 'checkout');
    return await api(data);
  }

  async getShipmentStatus() {
    const api = this.getApiCaller(HttpMethod.POST, 'get_shipment_statuses');
    return await api();
  }

  async getShipments(data: GetShipmentsDto) {
    const api = this.getApiCaller(HttpMethod.POST, 'get_shipments');
    return await api(data);
  }

  async getShipmentHistory() {
    const api = this.getApiCaller(HttpMethod.POST, 'get_shipment_history');
    return await api();
  }
}
