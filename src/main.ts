import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LoggerService } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { envs } from './config/envs';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener el logger de Winston configurado en AppModule y usarlo globalmente
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Habilitar cookies parser (necesario para refresh tokens)
  app.use(cookieParser());

  // permitir que class-validator resuelva validators mediante el contenedor de Nest
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  console.log(envs.origin);
  // Configurar CORS con soporte para cookies
  app.enableCors({
    origin: envs.origin, // URLs comunes de desarrollo
    credentials: true, // Permitir envío de cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS - RBAC Dynamic')
    .setDescription('NestJS RBAC Dynamic endpoint')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(envs.port);

  logger.log(
    `Application running on: http://localhost:${envs.port}/api`,
    'Bootstrap',
  );
  logger.log(
    `Swagger documentation: http://localhost:${envs.port}/api`,
    'Bootstrap',
  );
  logger.log(`Environment: ${envs.nodeEnv}`, 'Bootstrap');
}
void bootstrap();
