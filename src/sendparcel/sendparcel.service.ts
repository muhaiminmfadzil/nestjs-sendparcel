import { HttpService, Inject, Injectable, LoggerService } from '@nestjs/common';
import { GetPostcodeDetailsDto } from './dto/get-postcode-details.dto';
import {
  CONFIG_OPTIONS,
  SendparcelOptions,
  HttpMethod,
} from './sendparcel.definition';

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

  private formUrlEncoded(obj: any) {
    return Object.keys(obj).reduce(
      (p, c) => p + `&${c}=${encodeURIComponent(obj[c])}`,
      '',
    );
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
        const formData = this.formUrlEncoded(dataObj);

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
        const formData = this.formUrlEncoded(dataObj);

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
        const formData = this.formUrlEncoded(dataObj);

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

  // async orderPayment(data: OrderPaymentDto) {
  //   const api = this.getApiCaller(HttpMethod.POST, 'EPPayOrderBulk');
  //   return await api({ bulk: [...data.bulk] });
  // }

  // async checkOrderStatus(data: CheckOrderStatusDto) {
  //   const api = this.getApiCaller(HttpMethod.POST, 'EPOrderStatusBulk');
  //   return await api({ bulk: [...data.bulk] });
  // }

  // async checkParcelStatus(data: CheckParcelStatusDto) {
  //   const api = this.getApiCaller(HttpMethod.POST, 'EPParcelStatusBulk');
  //   return await api({ bulk: [...data.bulk] });
  // }

  // async trackParcel(data: TrackingParcelDto) {
  //   const api = this.getApiCaller(HttpMethod.POST, 'EPTrackingBulk');
  //   return await api({ bulk: [...data.bulk] });
  // }

  // async checkCredit() {
  //   const api = this.getApiCaller(HttpMethod.POST, 'EPCheckCreditBalance');
  //   return await api();
  // }

  // async expressOrder(data: ExpressOrderDto) {
  //   const api = this.getApiCaller(HttpMethod.POST, 'EPSubmitOrderBulkV3');
  //   // Preparing data
  //   const bulk = [...data.bulk];
  //   const courier = [...data.courier];
  //   const dropoff = data.dropoff;

  //   return await api({ bulk, courier, dropoff });
  // }
}
