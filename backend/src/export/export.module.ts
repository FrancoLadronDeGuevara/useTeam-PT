import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [BoardModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
