import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true }),
  );

  // config swagger api
  const config = new DocumentBuilder()
    .setTitle('My Project API')
    .setDescription(
      'The API description for my awesome project',
    )
    .setVersion('1.0')
    .addTag('bookmark')
    .build();
  const document = SwaggerModule.createDocument(
    app,
    config,
  );
  SwaggerModule.setup('api', app, document);

  await app.listen(3333);
}
bootstrap();
