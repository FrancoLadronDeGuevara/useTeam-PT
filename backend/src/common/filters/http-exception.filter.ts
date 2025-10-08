import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones para manejar todos los errores de la aplicación
 *
 * Este filtro captura todas las excepciones no manejadas y las convierte en
 * respuestas HTTP estructuradas con mensajes en español. Proporciona logging
 * detallado para facilitar el debugging y mantiene un formato consistente
 * para todas las respuestas de error.
 *
 * @example
 * ```typescript
 * // Se aplica globalmente en main.ts
 * app.useGlobalFilters(new AllExceptionsFilter());
 * ```
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Maneja las excepciones capturadas y genera respuestas HTTP apropiadas
   *
   * @param exception - La excepción capturada
   * @param host - Contexto de la aplicación (request/response)
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error = 'Error';

    // Maneja excepciones HTTP específicas
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      // Maneja errores de JavaScript estándar
      message = exception.message;
      error = exception.name;
    }

    // Registra el error para debugging
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Responde con un formato estructurado
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: error,
      message: Array.isArray(message) ? message : [message],
    });
  }
}
