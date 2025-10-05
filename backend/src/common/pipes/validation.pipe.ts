import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors: ValidationError[] = await validate(object);

    if (errors.length > 0) {
      const messages = errors
        .map((err: ValidationError) => {
          if (err.constraints && Object.keys(err.constraints).length > 0) {
            return Object.values(err.constraints).join(', ');
          }

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
              : `Validation error on property ${err.property}`;
          }

          return `Validation error on property ${err.property}`;
        })
        .filter((message): message is string => message !== null);

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
