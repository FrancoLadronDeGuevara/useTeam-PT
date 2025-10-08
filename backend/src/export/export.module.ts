import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { BoardModule } from '../board/board.module';

/**
 * Módulo de exportación
 *
 * Proporciona funcionalidades para exportar tableros Kanban a CSV
 * mediante integración con N8N. Incluye endpoints para iniciar
 * exportaciones, verificar el estado del sistema y obtener datos.
 */
@Module({
  imports: [BoardModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
