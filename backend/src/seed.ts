import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BoardService } from './board/board.service';
import { Types } from 'mongoose';

interface DocumentWithId {
  _id: Types.ObjectId;
  title: string;
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const boardService = app.get(BoardService);

  try {
    console.log('Iniciando seed de la base de datos...');

    const board = (await boardService.createBoard({
      title: 'Proyecto de Desarrollo Web',
      description: 'Board de ejemplo para gestionar tareas del proyecto',
    })) as DocumentWithId;

    const boardId = board._id.toString();

    console.log(`Board creado: ${board.title} (${boardId})`);

    const todoColumn = (await boardService.createColumn({
      title: 'To Do',
      boardId: boardId,
      position: 0,
    })) as DocumentWithId;

    const inProgressColumn = (await boardService.createColumn({
      title: 'In Progress',
      boardId: boardId,
      position: 1,
    })) as DocumentWithId;

    const doneColumn = (await boardService.createColumn({
      title: 'Done',
      boardId: boardId,
      position: 2,
    })) as DocumentWithId;

    console.log(
      `Columnas creadas: ${todoColumn.title}, ${inProgressColumn.title}, ${doneColumn.title}`,
    );

    await boardService.createCard({
      title: 'Diseñar interfaz de usuario',
      description: 'Crear mockups y prototipos en Figma',
      columnId: todoColumn._id.toString(),
      position: 0,
    });

    await boardService.createCard({
      title: 'Configurar base de datos',
      description: 'Instalar MongoDB y configurar schemas',
      columnId: todoColumn._id.toString(),
      position: 1,
    });

    await boardService.createCard({
      title: 'Implementar autenticación',
      description: 'Sistema de login con JWT',
      columnId: todoColumn._id.toString(),
      position: 2,
    });

    await boardService.createCard({
      title: 'Desarrollar API REST',
      description: 'Endpoints para CRUD de tareas',
      columnId: inProgressColumn._id.toString(),
      position: 0,
    });

    await boardService.createCard({
      title: 'Integrar WebSockets',
      description: 'Socket.io para tiempo real',
      columnId: inProgressColumn._id.toString(),
      position: 1,
    });

    await boardService.createCard({
      title: 'Setup del proyecto',
      description: 'Inicializar NestJS y React',
      columnId: doneColumn._id.toString(),
      position: 0,
    });

    await boardService.createCard({
      title: 'Configurar Docker',
      description: 'Docker Compose para MongoDB y N8N',
      columnId: doneColumn._id.toString(),
      position: 1,
    });

    console.log('Tarjetas creadas exitosamente');
    console.log('\nSeed completado! La base de datos está lista.');
    console.log(`\nBoard ID: ${board._id}`);
    console.log(`Acceder al board completo en: GET /api/boards/${board._id}/full`);
  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await app.close();
  }
}

seed();
