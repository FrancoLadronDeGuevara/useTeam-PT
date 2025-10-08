import { Controller, Get, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.check();
  }

  @Get('db')
  checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Post('confirm-export')
  @HttpCode(HttpStatus.OK)
  confirmExport(@Body() body: any) {
    this.logger.log(`Export confirmation received: ${JSON.stringify(body)}`);
    return {
      status: 'success',
      message: 'Export confirmation processed',
      timestamp: new Date(),
      details: body,
    };
  }
}
