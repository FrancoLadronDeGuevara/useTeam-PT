import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportBacklogDto, ExportConfirmDto } from './dto/export.dto';

@Controller('export')
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @Post('backlog')
  @HttpCode(HttpStatus.ACCEPTED)
  async exportBacklog(@Body() exportDto: ExportBacklogDto) {
    return this.exportService.exportBacklog(exportDto);
  }

  @Get('health')
  async checkHealth() {
    return this.exportService.checkN8nHealth();
  }

  @Get('columns')
  async getColumns() {
    return this.exportService.getAllColumns();
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmExport(@Body() body: any) {
    // Endpoint sin validación para N8N
    this.logger.log(`Export confirmation received: ${JSON.stringify(body)}`);
    return {
      status: 'success',
      message: 'Export confirmation processed',
      timestamp: new Date(),
      details: body,
    };
  }

  @Post('confirm-simple')
  @HttpCode(HttpStatus.OK)
  async confirmExportSimple(@Body() body: any) {
    return {
      status: 'success',
      message: 'Export confirmation processed',
      timestamp: new Date(),
      details: body,
    };
  }
}
