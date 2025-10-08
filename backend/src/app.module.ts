import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './board/board.module';
import { ExportModule } from './export/export.module';
import { HealthModule } from './health/health.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, appConfig],
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB conectado exitosamente');
        });
        connection.on('error', (error) => {
          console.error('Error de conexión a MongoDB:', error);
        });
        return connection;
      },
    }),

    BoardModule,
    ExportModule,
    HealthModule,
  ],
})
export class AppModule {}
