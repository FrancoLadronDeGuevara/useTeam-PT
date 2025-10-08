import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Módulo de verificaciones de salud
 *
 * Proporciona endpoints para monitorear el estado de la aplicación
 * y la conectividad con la base de datos MongoDB.
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
