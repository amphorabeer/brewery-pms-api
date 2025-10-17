import { Module } from '@nestjs/common';
import { TanksController } from './tanks.controller';
import { TanksService } from './tanks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TanksController],
  providers: [TanksService],
  exports: [TanksService],
})
export class TanksModule {}
