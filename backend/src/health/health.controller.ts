import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Controlador para verificaciones de salud del sistema
 *
 * Proporciona endpoints para verificar el estado general de la aplicación
 * y la conectividad con la base de datos MongoDB.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Verifica el estado general de la aplicación
   *
   * @returns Estado de la aplicación con información básica
   */
  @Get()
  check() {
    return this.healthService.check();
  }

  /**
   * Verifica el estado de la conexión con la base de datos
   *
   * @returns Estado de conectividad con MongoDB
   */
  @Get('db')
  checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
