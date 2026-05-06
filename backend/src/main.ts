import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Elimina campos no declarados en DTO
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors(); // Necesario para que el frontend pueda conectar

await app.listen(3000, '0.0.0.0');
  console.log('🚀 Backend corriendo en http://localhost:3000');
}
bootstrap();