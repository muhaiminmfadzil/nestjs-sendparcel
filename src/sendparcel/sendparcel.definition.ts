import { LoggerService } from '@nestjs/common';

export const CONFIG_OPTIONS = 'SENDPARCEL_CONFIG_OPTIONS';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export interface SendparcelOptions {
  apiKey: string;
  demo: boolean;
  logger?: LoggerService;
}
