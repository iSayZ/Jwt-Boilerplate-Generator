import { Module } from '@nestjs/common';
import { GenerateController } from './generate.controller.js';
import { GenerateService } from './generate.service.js';

@Module({
    imports: [],
    controllers: [GenerateController],
    providers: [GenerateService],
})

export class GenerateModule {}
