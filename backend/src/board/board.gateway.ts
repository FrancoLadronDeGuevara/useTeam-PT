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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedUsers.set(client.id, `User-${client.id.substring(0, 6)}`);

    this.server.emit('user-connected', {
      userId: client.id,
      totalUsers: this.connectedUsers.size,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);

    this.server.emit('user-disconnected', {
      userId: client.id,
      totalUsers: this.connectedUsers.size,
    });
  }

  @SubscribeMessage('card:create')
  async handleCreateCard(@MessageBody() data: CreateCardDto, @ConnectedSocket() client: Socket) {
    try {
      const card = await this.boardService.createCard(data);

      client.broadcast.emit('card:created', card);

      this.logger.log(`Card created: ${card._id}`);
      return { success: true, data: card };
    } catch (error) {
      this.logger.error('Error creating card:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('card:update')
  async handleUpdateCard(
    @MessageBody() data: { id: string; updates: UpdateCardDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const card = await this.boardService.updateCard(data.id, data.updates);

      client.broadcast.emit('card:updated', card);

      this.logger.log(`Card updated: ${card._id}`);
      return { success: true, data: card };
    } catch (error) {
      this.logger.error('Error updating card:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('card:delete')
  async handleDeleteCard(@MessageBody() data: { id: string }, @ConnectedSocket() client: Socket) {
    try {
      await this.boardService.deleteCard(data.id);

      client.broadcast.emit('card:deleted', { id: data.id });

      this.logger.log(`Card deleted: ${data.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting card:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('card:move')
  async handleMoveCard(@MessageBody() data: MoveCardDto, @ConnectedSocket() client: Socket) {
    try {
      const card = await this.boardService.moveCard(data);

      client.broadcast.emit('card:moved', {
        card,
        moveData: data,
      });

      this.logger.log(`Card moved: ${card._id}`);
      return { success: true, data: card };
    } catch (error) {
      this.logger.error('Error moving card:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('column:create')
  async handleCreateColumn(
    @MessageBody() data: CreateColumnDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const column = await this.boardService.createColumn(data);

      client.broadcast.emit('column:created', column);

      this.logger.log(`Column created: ${column._id}`);
      return { success: true, data: column };
    } catch (error) {
      this.logger.error('Error creating column:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('column:update')
  async handleUpdateColumn(
    @MessageBody() data: { id: string; updates: UpdateColumnDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const column = await this.boardService.updateColumn(data.id, data.updates);

      client.broadcast.emit('column:updated', column);

      this.logger.log(`Column updated: ${column._id}`);
      return { success: true, data: column };
    } catch (error) {
      this.logger.error('Error updating column:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('column:delete')
  async handleDeleteColumn(@MessageBody() data: { id: string }, @ConnectedSocket() client: Socket) {
    try {
      await this.boardService.deleteColumn(data.id);

      client.broadcast.emit('column:deleted', { id: data.id });

      this.logger.log(`Column deleted: ${data.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting column:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('board:join')
  handleJoinBoard(@MessageBody() data: { boardId: string }, @ConnectedSocket() client: Socket) {
    client.join(`board:${data.boardId}`);
    this.logger.log(`Client ${client.id} joined board ${data.boardId}`);

    return { success: true, message: `Joined board ${data.boardId}` };
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(@MessageBody() data: { boardId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`board:${data.boardId}`);
    this.logger.log(`Client ${client.id} left board ${data.boardId}`);

    return { success: true, message: `Left board ${data.boardId}` };
  }
}
