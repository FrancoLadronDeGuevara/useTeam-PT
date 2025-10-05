import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportBacklogDto } from './dto/export.dto';

@Controller('export')
export class ExportController {
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
}
