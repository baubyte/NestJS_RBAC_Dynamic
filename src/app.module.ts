import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { envs } from './config/envs';
import { SeedModule } from './seed/seed.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { AccessControlModule } from './access-control/access-control.module';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: envs.dbHost,
      port: envs.dbPort,
      username: envs.dbUsername,
      password: envs.dbPassword || '',
      database: envs.dbName,
      autoLoadEntities: true,
      synchronize: envs.dbSynchronize,
      logging: envs.nodeEnv === 'development',
      migrationsRun: false,
      extra: {
        connectionLimit: 10, // Adjust based on your database connection pool requirements
      },
    }),
    SeedModule,
    ProductModule,
    CommonModule,
    FilesModule,
    CategoryModule,
    AccessControlModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
