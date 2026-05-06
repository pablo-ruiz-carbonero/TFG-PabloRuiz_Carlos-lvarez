import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsNumber()
  cultivo_id: number;

  @IsEnum(['siembra', 'riego', 'fertilizacion', 'cosecha'])
  tipo: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @IsOptional()
  @IsString()
  unidad?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(['siembra', 'riego', 'fertilizacion', 'cosecha'])
  tipo?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsEnum(['pendiente', 'completada'])
  status?: string;
}