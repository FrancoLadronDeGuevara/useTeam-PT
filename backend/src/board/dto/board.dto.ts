import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'primaryColor must be a valid hex color' })
  primaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'backgroundColor must be a valid hex color' })
  backgroundColor?: string;
}

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'primaryColor must be a valid hex color' })
  primaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'backgroundColor must be a valid hex color' })
  backgroundColor?: string;
}

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  @IsNotEmpty()
  boardId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;
}

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;
}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  columnId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'backgroundColor must be a valid hex color' })
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'textColor must be a valid hex color' })
  textColor?: string;
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'backgroundColor must be a valid hex color' })
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'textColor must be a valid hex color' })
  textColor?: string;
}

export class MoveCardDto {
  @IsMongoId()
  @IsNotEmpty()
  cardId: string;

  @IsMongoId()
  @IsNotEmpty()
  sourceColumnId: string;

  @IsMongoId()
  @IsNotEmpty()
  destinationColumnId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  sourcePosition: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  destinationPosition: number;
}
