import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { envs } from './config/envs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // permitir que class-validator resuelva validators mediante el contenedor de Nest
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const logger = new Logger('Bootstrap');
  app.enableCors({ origin: '*' });
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
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(envs.port);
  logger.log(`App running in port ${envs.port}`);
}
void bootstrap();
