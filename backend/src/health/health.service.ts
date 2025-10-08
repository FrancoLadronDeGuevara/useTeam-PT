import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Servicio para verificaciones de salud del sistema
 *
 * Proporciona métodos para verificar el estado general de la aplicación
 * y la conectividad con la base de datos MongoDB.
 */
@Injectable()
export class HealthService {
  constructor(@InjectConnection() private connection: Connection) {}

  /**
   * Verifica el estado general de la aplicación
   *
   * @returns Información básica del estado de la aplicación
   */
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Verifica el estado de la conexión con la base de datos
   *
   * @returns Estado de conectividad con MongoDB
   */
  async checkDatabase() {
    try {
      const state = this.connection.readyState;
      const states = {
        0: 'desconectado',
        1: 'conectado',
        2: 'conectando',
        3: 'desconectando',
      };

      return {
        status: state === 1 ? 'ok' : 'error',
        database: states[state] || 'desconocido',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'desconectado',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
