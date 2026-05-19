import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";

export class RegisterDto {
  // FIX: el campo se llama "nombre" (igual que la entidad User)
  //    antes el mobile enviaba "name" → el backend lo ignoraba → usuario sin nombre
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}
