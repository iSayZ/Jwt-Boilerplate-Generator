import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GenerateController } from './generate/generate.controller.js';
import { GenerateService } from './generate/generate.service.js';
import { GenerateModule } from './generate/generate.module.js';

@Module({
  imports: [GenerateModule],
  controllers: [AppController, GenerateController],
  providers: [AppService, GenerateService],
})
export class AppModule {}
