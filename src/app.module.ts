import  { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';


@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
     PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
