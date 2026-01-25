import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller()
@Public()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
