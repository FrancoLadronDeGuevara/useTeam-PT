import { IsString, IsNotEmpty, IsEmail, IsOptional, IsMongoId, IsArray } from 'class-validator';

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
