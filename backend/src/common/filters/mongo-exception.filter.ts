import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

/**
 * Filtro especializado para manejar errores de MongoDB
 *
 * Este filtro captura específicamente los errores de MongoDB y los convierte
 * en respuestas HTTP apropiadas con mensajes descriptivos.
 * Maneja códigos de error comunes como duplicados y validación de documentos.
 *
 * @example
 * ```typescript
 * // Se aplica globalmente en main.ts
 * app.useGlobalFilters(new MongoExceptionFilter());
 * ```
 */
@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  /**
   * Maneja los errores específicos de MongoDB
   *
   * @param exception - El error de MongoDB capturado
   * @param host - Contexto de la aplicación (request/response)
   */
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error de base de datos';

    // Mapea códigos de error específicos de MongoDB
    switch (exception.code) {
      case 11000:
        // Error de clave duplicada
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con estos datos';
        break;
      case 121:
        // Error de validación de documento
        status = HttpStatus.BAD_REQUEST;
        message = 'Error de validación del documento';
        break;
      case 11001:
        // Error de índice duplicado
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con este valor único';
        break;
      case 2:
        // Error de conexión
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'No se pudo conectar con la base de datos';
        break;
      case 18:
        // Error de autenticación
        status = HttpStatus.UNAUTHORIZED;
        message = 'Error de autenticación con la base de datos';
        break;
      default:
        // Error no específico - registra para debugging
        this.logger.error('Error de MongoDB:', exception);
        message = 'Error interno de base de datos';
        break;
    }

    // Responde con el error estructurado
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: message,
      error: exception.name,
      code: exception.code, // Incluye el código de error de MongoDB para debugging
    });
  }
}
