import { Controller, Post, Body, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportBacklogDto } from './dto/export.dto';

/**
 * Controlador para funcionalidades de exportación
 *
 * Maneja las peticiones relacionadas con la exportación de tableros Kanban,
 * incluyendo la verificación de salud del sistema y la obtención de datos.
 */
@Controller('export')
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  /**
   * Inicia el proceso de exportación de un tablero
   *
   * @param exportDto - Datos de la exportación (boardId, recipientEmail, fields)
   * @returns Respuesta con el estado de la solicitud de exportación
   */
  @Post('backlog')
  @HttpCode(HttpStatus.ACCEPTED)
  async exportBacklog(@Body() exportDto: ExportBacklogDto) {
    return this.exportService.exportBacklog(exportDto);
  }

  /**
   * Verifica el estado de salud del servicio N8N
   *
   * @returns Estado de conectividad con N8N
   */
  @Get('health')
  async checkHealth() {
    return this.exportService.checkN8nHealth();
  }

  /**
   * Obtiene todas las columnas y tarjetas de todos los tableros
   *
   * Este endpoint es utilizado por el workflow de N8N para obtener los datos
   * que serán exportados en el archivo CSV.
   *
   * @returns Array con todas las columnas y sus tarjetas
   */
  @Get('columns')
  async getColumns() {
    return this.exportService.getAllColumns();
  }
}
