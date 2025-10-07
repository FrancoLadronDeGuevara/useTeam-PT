import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { BoardService } from './board.service';
import {
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  CreateColumnDto,
  UpdateColumnDto,
} from './dto/board.dto';
import { Card } from './schemas/card.schema';

/**
 * Gateway de WebSocket para sincronización en tiempo real de tableros.
 *
 * Maneja la conexión de usuarios, notificaciones de cambios y
 * sincronización entre múltiples clientes conectados al mismo tablero.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('BoardGateway');
  private connectedUsers = new Map<string, string>();

  constructor(private readonly boardService: BoardService) {}

  /**
   * Maneja la conexión de un nuevo cliente.
   * Registra al usuario y notifica a todos los clientes conectados.
   */
  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    this.connectedUsers.set(client.id, `Usuario-${client.id.substring(0, 6)}`);

    this.server.emit('user-connected', {
      userId: client.id,
      totalUsers: this.connectedUsers.size,
    });
  }

  /**
   * Maneja la desconexión de un cliente.
   * Remueve al usuario y notifica a los clientes restantes.
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    this.connectedUsers.delete(client.id);

    this.server.emit('user-disconnected', {
      userId: client.id,
      totalUsers: this.connectedUsers.size,
    });
  }

  /**
   * Maneja la notificación de creación de tarjeta.
   * La tarjeta ya fue creada via API, solo notificamos a otros clientes.
   */
  @SubscribeMessage('card:create')
  async handleCreateCard(@MessageBody() card: CreateCardDto, @ConnectedSocket() client: Socket) {
    try {
      // Obtenemos la columna para saber a qué tablero pertenece
      const column = await this.boardService.getColumn(card.columnId.toString());

      // Notificamos a otros clientes del mismo tablero
      client.to(`board:${column.boardId}`).emit('card:created', card);

      this.logger.log(`Notificación de tarjeta creada enviada al tablero: ${column.boardId}`);
      return { success: true, data: card };
    } catch (error) {
      this.logger.error('Error notificando creación de tarjeta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja la actualización de una tarjeta.
   * Actualiza en la base de datos y notifica a otros clientes.
   */
  @SubscribeMessage('card:update')
  async handleUpdateCard(
    @MessageBody() data: { id: string; updates: UpdateCardDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const card = await this.boardService.updateCard(data.id, data.updates);
      const column = await this.boardService.getColumn(card.columnId.toString());

      // Notificamos a otros clientes del mismo tablero
      client.to(`board:${column.boardId}`).emit('card:updated', card);

      this.logger.log(`Tarjeta actualizada: ${card._id}`);
      return { success: true, data: card };
    } catch (error) {
      this.logger.error('Error actualizando tarjeta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja la eliminación de una tarjeta.
   * Elimina de la base de datos y notifica a otros clientes.
   */
  @SubscribeMessage('card:delete')
  async handleDeleteCard(@MessageBody() data: { id: string }, @ConnectedSocket() client: Socket) {
    try {
      // Obtenemos la tarjeta y su columna antes de eliminar para saber el boardId
      const card = await this.boardService.getCard(data.id);
      const column = await this.boardService.getColumn(card.columnId.toString());

      await this.boardService.deleteCard(data.id);

      // Notificamos a otros clientes del mismo tablero
      client.to(`board:${column.boardId}`).emit('card:deleted', { id: data.id });

      this.logger.log(`Tarjeta eliminada: ${data.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error eliminando tarjeta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja el movimiento de una tarjeta entre columnas o posiciones.
   * Actualiza en la base de datos y notifica a otros clientes.
   */
  @SubscribeMessage('card:move')
  async handleMoveCard(@MessageBody() data: MoveCardDto, @ConnectedSocket() client: Socket) {
    try {
      this.logger.log(
        `Moviendo tarjeta ${data.cardId} de columna ${data.sourceColumnId} a ${data.destinationColumnId}`,
      );

      // Movemos la tarjeta en la base de datos
      const card = await this.boardService.moveCard(data);
      this.logger.log(`Tarjeta movida exitosamente en BD: ${card._id}`);

      // Obtenemos la columna destino para saber el boardId
      const destColumn = await this.boardService.getColumn(data.destinationColumnId);

      // Notificamos a otros clientes del mismo tablero
      client.to(`board:${destColumn.boardId}`).emit('card:moved', {
        card,
        moveData: data,
      });

      this.logger.log(
        `Tarjeta movida: ${card._id} y notificación enviada al tablero:${destColumn.boardId}`,
      );
      return { success: true, data: card };
    } catch (error) {
      this.logger.error('Error moviendo tarjeta:', error);
      this.logger.error('Error moving card:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja la creación de una nueva columna.
   * Crea en la base de datos y notifica a otros clientes del mismo tablero.
   */
  @SubscribeMessage('column:create')
  async handleCreateColumn(
    @MessageBody() data: CreateColumnDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const column = await this.boardService.createColumn(data);

      // Notificamos a otros clientes del mismo tablero
      client.to(`board:${data.boardId}`).emit('column:created', column);

      this.logger.log(`Columna creada: ${column._id}`);
      return { success: true, data: column };
    } catch (error) {
      this.logger.error('Error creando columna:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja la actualización de una columna.
   * Actualiza en la base de datos y notifica a todos los clientes.
   */
  @SubscribeMessage('column:update')
  async handleUpdateColumn(
    @MessageBody() data: { id: string; updates: UpdateColumnDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const column = await this.boardService.updateColumn(data.id, data.updates);

      // Notificamos a TODOS los clientes conectados (sala global)
      this.server.emit('column:updated', column);

      this.logger.log(`Columna actualizada: ${column._id}`);
      return { success: true, data: column };
    } catch (error) {
      this.logger.error('Error actualizando columna:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja la eliminación de una columna.
   * Elimina de la base de datos (con eliminación en cascada de tarjetas) y notifica a otros clientes.
   */
  @SubscribeMessage('column:delete')
  async handleDeleteColumn(@MessageBody() data: { id: string }, @ConnectedSocket() client: Socket) {
    try {
      // Obtenemos la columna antes de eliminar para saber el boardId
      const column = await this.boardService.getColumn(data.id);

      await this.boardService.deleteColumn(data.id);

      // Notificamos a otros clientes del mismo tablero
      client.to(`board:${column.boardId}`).emit('column:deleted', { id: data.id });

      this.logger.log(`Columna eliminada: ${data.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting column:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maneja la unión de un cliente a un tablero específico.
   * Permite recibir notificaciones de cambios en ese tablero.
   */
  @SubscribeMessage('board:join')
  handleJoinBoard(@MessageBody() data: { boardId: string }, @ConnectedSocket() client: Socket) {
    this.logger.log(`Cliente ${client.id} intentando unirse al tablero ${data.boardId}`);
    client.join(`board:${data.boardId}`);
    this.logger.log(`Cliente ${client.id} se unió al tablero ${data.boardId}`);

    // Verificar cuántos clientes están en la sala después de unirse
    const room = this.server.sockets.adapter.rooms.get(`board:${data.boardId}`);
    const roomSize = room ? room.size : 0;
    console.log(`DEBUG: Clientes en sala board:${data.boardId} después de unirse: ${roomSize}`);

    return { success: true, message: `Unido al tablero ${data.boardId}` };
  }

  /**
   * Maneja la salida de un cliente de un tablero específico.
   * Deja de recibir notificaciones de cambios en ese tablero.
   */
  @SubscribeMessage('board:leave')
  handleLeaveBoard(@MessageBody() data: { boardId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`board:${data.boardId}`);
    this.logger.log(`Cliente ${client.id} salió del tablero ${data.boardId}`);

    return { success: true, message: `Salió del tablero ${data.boardId}` };
  }

  /**
   * Maneja la actualización de un tablero.
   * Notifica a todos los clientes conectados al tablero sobre los cambios.
   */
  @SubscribeMessage('board:update')
  async handleUpdateBoard(
    @MessageBody() data: { id: string; updates: { title: string; description?: string } },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Recibida actualización de tablero: ${data.id}`, data.updates);

      // Verificar cuántos clientes están en la sala
      const room = this.server.sockets.adapter.rooms.get(`board:${data.id}`);
      const roomSize = room ? room.size : 0;
      this.logger.log(`Clientes en sala board:${data.id}: ${roomSize}`);
      console.log(`DEBUG: Clientes en sala board:${data.id}: ${roomSize}`);

      // Notificamos a TODOS los clientes conectados (sala global)
      this.server.emit('board:updated', {
        id: data.id,
        title: data.updates.title,
        description: data.updates.description,
      });

      this.logger.log(`Notificación enviada a TODOS los clientes conectados (sala global)`);
      return { success: true, message: 'Tablero actualizado' };
    } catch (error) {
      this.logger.error('Error notificando actualización de tablero:', error);
      return { success: false, error: error.message };
    }
  }
}
