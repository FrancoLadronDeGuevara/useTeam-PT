import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { SKIP_VALIDATION_KEY } from '../decorators/skip-validation.decorator';

@Injectable()
export class SkipValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipValidation = this.reflector.getAllAndOverride<boolean>(SKIP_VALIDATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipValidation) {
      // No hacer nada especial, solo continuar
    }

    return next.handle();
  }
}
