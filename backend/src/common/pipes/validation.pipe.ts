import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Pipe personalizado para validación de datos de entrada
 *
 * Este pipe se encarga de validar automáticamente los datos que llegan a los endpoints
 * utilizando las decoraciones de class-validator. Proporciona mensajes de error
 * detallados en español y maneja tanto validaciones simples como anidadas.
 *
 * @example
 * ```typescript
 * @Post()
 * @UsePipes(ValidationPipe)
 * async create(@Body() createDto: CreateBoardDto) {
 *   // Los datos se validan automáticamente
 * }
 * ```
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  /**
   * Transforma y valida los datos de entrada
   *
   * @param value - Los datos a validar
   * @param metatype - Metadatos del tipo de datos esperado
   * @returns Los datos validados o lanza una excepción si hay errores
   */
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Si no hay metatype o no es un tipo válido para validar, retorna el valor original
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Convierte el objeto plano a una instancia de la clase DTO
    const object = plainToClass(metatype, value);
    const errors: ValidationError[] = await validate(object);

    if (errors.length > 0) {
      const messages = errors
        .map((err: ValidationError) => {
          // Si hay restricciones de validación, las convierte a mensajes
          if (err.constraints && Object.keys(err.constraints).length > 0) {
            return Object.values(err.constraints).join(', ');
          }

          // Si hay errores anidados (objetos complejos), los procesa recursivamente
          if (err.children && err.children.length > 0) {
            const childMessages = err.children
              .map((child) => {
                if (child.constraints) {
                  return Object.values(child.constraints).join(', ');
                }
                return null;
              })
              .filter(Boolean);

            return childMessages.length > 0
              ? `${err.property}: ${childMessages.join(', ')}`
              : `Error de validación en la propiedad ${err.property}`;
          }

          return `Error de validación en la propiedad ${err.property}`;
        })
        .filter((message): message is string => message !== null);

      throw new BadRequestException({
        message: 'Error de validación',
        errors: messages,
      });
    }

    return value;
  }

  /**
   * Verifica si el tipo de dato debe ser validado
   *
   * @param metatype - El tipo de dato a verificar
   * @returns true si debe validarse, false en caso contrario
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
