import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor para logging de peticiones HTTP
 *
 * Este interceptor registra automáticamente todas las peticiones HTTP que llegan
 * a la aplicación, incluyendo el método, URL, código de respuesta y tiempo de
 * procesamiento. Es útil para monitoreo, debugging y análisis de rendimiento.
 *
 * @example
 * ```typescript
 * // Aplicar globalmente en main.ts
 * app.useGlobalInterceptors(new LoggingInterceptor());
 *
 * // O aplicar a un controlador específico
 * @UseInterceptors(LoggingInterceptor)
 * @Controller('boards')
 * export class BoardController {}
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * Intercepta las peticiones HTTP y registra información de logging
   *
   * @param context - Contexto de ejecución de la petición
   * @param next - Handler para continuar con la petición
   * @returns Observable con la respuesta de la petición
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    // Registra el inicio de la petición (opcional)
    this.logger.log(`Iniciando petición: ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;

        // Registra el resultado de la petición con tiempo de procesamiento
        this.logger.log(
          `Petición completada: ${method} ${url} - ${response.statusCode} - ${delay}ms`,
        );
      }),
    );
  }
}
