import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interfaz para la respuesta transformada
 *
 * Define la estructura estándar de todas las respuestas de la API,
 * incluyendo los datos, código de estado y timestamp.
 */
export interface Response<T> {
  /** Los datos de la respuesta */
  data: T;
  /** Código de estado HTTP */
  statusCode: number;
  /** Timestamp de la respuesta en formato ISO */
  timestamp: string;
}

/**
 * Interceptor para transformar las respuestas de la API
 *
 * Este interceptor envuelve todas las respuestas de la API en un formato
 * estándar que incluye los datos, código de estado HTTP y timestamp.
 * Proporciona consistencia en todas las respuestas de la aplicación.
 *
 * @example
 * ```typescript
 * // Aplicar globalmente en main.ts
 * app.useGlobalInterceptors(new TransformInterceptor());
 *
 * // Respuesta resultante:
 * {
 *   "data": { "id": 1, "name": "Tablero" },
 *   "statusCode": 200,
 *   "timestamp": "2025-01-08T10:30:00.000Z"
 * }
 * ```
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * Intercepta las respuestas y las transforma al formato estándar
   *
   * @param context - Contexto de ejecución de la petición
   * @param next - Handler para continuar con la petición
   * @returns Observable con la respuesta transformada
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
