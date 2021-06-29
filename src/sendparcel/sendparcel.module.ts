import { DynamicModule, Global, HttpModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS, SendparcelOptions } from './sendparcel.definition';
import { SendparcelService } from './sendparcel.service';

@Global()
@Module({})
export class SendparcelModule {
  static forRoot(options: SendparcelOptions): DynamicModule {
    return {
      module: SendparcelModule,
      imports: [HttpModule],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        SendparcelService,
      ],
      exports: [SendparcelService],
    };
  }
}
