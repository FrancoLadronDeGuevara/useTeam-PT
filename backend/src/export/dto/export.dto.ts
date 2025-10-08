import { IsString, IsNotEmpty, IsEmail, IsOptional, IsMongoId, IsArray } from 'class-validator';

/**
 * DTO para la solicitud de exportación de un tablero
 *
 * Define la estructura de datos requerida para iniciar el proceso
 * de exportación de un tablero Kanban a CSV.
 */
export class ExportBacklogDto {
  /** ID del tablero a exportar */
  @IsMongoId()
  @IsNotEmpty()
  boardId: string;

  /** Email del destinatario del archivo CSV */
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  /** Campos específicos a incluir en la exportación (opcional) */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fields?: string[];
}
