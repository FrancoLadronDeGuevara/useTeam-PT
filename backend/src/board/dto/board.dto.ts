import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
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
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
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
