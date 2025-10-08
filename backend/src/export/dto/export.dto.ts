import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsMongoId,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Allow } from 'class-validator';

export class ExportBacklogDto {
  @IsMongoId()
  @IsNotEmpty()
  boardId: string;

  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fields?: string[];
}

export class ExportStatusDto {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  timestamp: Date;
}

export class ExportConfirmDto {
  @Allow()
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;

  @Allow()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Allow()
  @IsString()
  @IsNotEmpty()
  details: string;

  @Allow()
  @IsOptional()
  totalTasks?: string;

  @Allow()
  @IsOptional()
  timestamp?: string;
}
