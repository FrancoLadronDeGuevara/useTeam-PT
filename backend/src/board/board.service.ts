import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board } from './schemas/board.schema';
import { Column } from './schemas/column.schema';
import { Card } from './schemas/card.schema';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateColumnDto,
  UpdateColumnDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
} from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<Board>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
    @InjectModel(Card.name) private cardModel: Model<Card>,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new this.boardModel(createBoardDto);
    return board.save();
  }

  async getAllBoards(): Promise<Board[]> {
    return this.boardModel.find().sort({ createdAt: -1 }).exec();
  }

  async getBoardById(id: string): Promise<Board> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid board ID');
    }
    const board = await this.boardModel.findById(id).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return board;
  }

  async updateBoard(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardModel.findByIdAndUpdate(id, updateBoardDto, { new: true }).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return board;
  }

  async deleteBoard(id: string): Promise<void> {
    const columns = await this.columnModel.find({ boardId: id }).exec();
    const columnIds = columns.map((col) => col._id);
    await this.cardModel.deleteMany({ columnId: { $in: columnIds } }).exec();

    await this.columnModel.deleteMany({ boardId: id }).exec();

    const result = await this.boardModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
  }

  async createColumn(createColumnDto: CreateColumnDto): Promise<Column> {
    await this.getBoardById(createColumnDto.boardId);

    if (createColumnDto.position === undefined) {
      const lastColumn = await this.columnModel
        .findOne({ boardId: createColumnDto.boardId })
        .sort({ position: -1 })
        .exec();
      createColumnDto.position = lastColumn ? lastColumn.position + 1 : 0;
    }

    const column = new this.columnModel(createColumnDto);
    return column.save();
  }

  async getColumnsByBoardId(boardId: string): Promise<Column[]> {
    return this.columnModel.find({ boardId }).sort({ position: 1 }).exec();
  }

  async updateColumn(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    const column = await this.columnModel
      .findByIdAndUpdate(id, updateColumnDto, { new: true })
      .exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }
    return column;
  }

  /**
   * Elimina una columna y todas sus tarjetas asociadas (eliminación en cascada).
   * Esto asegura la integridad de los datos removiendo todas las tarjetas dependientes.
   */
  async deleteColumn(id: string): Promise<void> {
    // Primero eliminamos todas las tarjetas de esta columna
    await this.cardModel.deleteMany({ columnId: new Types.ObjectId(id) }).exec();

    // Después eliminamos la columna en sí
    const result = await this.columnModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`No se encontró la columna con ID ${id}`);
    }
  }

  /**
   * Crea una nueva tarjeta en la columna especificada.
   * Asigna automáticamente la posición si no se proporciona (la agrega al final).
   * Convierte el columnId de string a ObjectId para almacenamiento en la base de datos.
   */
  async createCard(createCardDto: CreateCardDto): Promise<Card> {
    // Verificamos que la columna existe
    const column = await this.columnModel.findById(createCardDto.columnId).exec();
    if (!column) {
      throw new NotFoundException(`No se encontró la columna con ID ${createCardDto.columnId}`);
    }

    // Si no se especifica posición, la asignamos automáticamente al final
    if (createCardDto.position === undefined) {
      const ultimaTarjeta = await this.cardModel
        .findOne({ columnId: new Types.ObjectId(createCardDto.columnId) })
        .sort({ position: -1 })
        .exec();
      createCardDto.position = ultimaTarjeta ? ultimaTarjeta.position + 1 : 0;
    }

    // Creamos la tarjeta convirtiendo el columnId a ObjectId
    const card = new this.cardModel({
      ...createCardDto,
      columnId: new Types.ObjectId(createCardDto.columnId),
    });
    return card.save();
  }

  /**
   * Obtiene todas las tarjetas de una columna específica, ordenadas por posición.
   */
  async getCardsByColumnId(columnId: string): Promise<Card[]> {
    return this.cardModel
      .find({ columnId: new Types.ObjectId(columnId) })
      .sort({ position: 1 })
      .exec();
  }

  /**
   * Obtiene todas las tarjetas de un tablero (de todas sus columnas).
   * Útil para operaciones que necesitan ver todas las tarjetas del tablero.
   */
  async getCardsByBoardId(boardId: string): Promise<Card[]> {
    const columnas = await this.columnModel.find({ boardId }).exec();
    const columnIds = columnas.map((col) => col._id);
    return this.cardModel
      .find({ columnId: { $in: columnIds } })
      .sort({ position: 1 })
      .exec();
  }

  /**
   * Elimina todas las tarjetas de la base de datos.
   * Solo para operaciones de limpieza/debug.
   */
  async deleteAllCards(): Promise<{ deletedCount: number }> {
    const result = await this.cardModel.deleteMany({});
    return { deletedCount: result.deletedCount };
  }

  /**
   * Actualiza una tarjeta existente con los nuevos datos.
   */
  async updateCard(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardModel.findByIdAndUpdate(id, updateCardDto, { new: true }).exec();
    if (!card) {
      throw new NotFoundException(`No se encontró la tarjeta con ID ${id}`);
    }
    return card;
  }

  /**
   * Elimina una tarjeta específica.
   */
  async deleteCard(id: string): Promise<void> {
    const result = await this.cardModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`No se encontró la tarjeta con ID ${id}`);
    }
  }

  /**
   * Mueve una tarjeta de una posición a otra, ya sea dentro de la misma columna
   * o entre columnas diferentes. Maneja automáticamente el reordenamiento de posiciones.
   */
  async moveCard(moveCardDto: MoveCardDto): Promise<Card> {
    const { cardId, sourceColumnId, destinationColumnId, sourcePosition, destinationPosition } =
      moveCardDto;

    // Verificamos que la tarjeta existe
    const card = await this.cardModel.findById(cardId).exec();
    if (!card) {
      throw new NotFoundException(`No se encontró la tarjeta con ID ${cardId}`);
    }

    // Si es la misma columna, solo reordenamos las posiciones
    if (sourceColumnId === destinationColumnId) {
      await this.reorderCardsInSameColumn(sourceColumnId, sourcePosition, destinationPosition);
    } else {
      // Si es entre columnas, movemos y reordenamos ambas columnas
      await this.moveCardBetweenColumns(
        cardId,
        sourceColumnId,
        destinationColumnId,
        sourcePosition,
        destinationPosition,
      );
    }

    // Actualizamos la tarjeta con la nueva columna y posición
    const updatedCard = await this.cardModel
      .findByIdAndUpdate(
        cardId,
        {
          columnId: new Types.ObjectId(destinationColumnId),
          position: destinationPosition,
        },
        { new: true },
      )
      .exec();

    if (!updatedCard) {
      throw new NotFoundException(`No se encontró la tarjeta con ID ${cardId}`);
    }
    return updatedCard;
  }

  /**
   * Reordena las tarjetas dentro de la misma columna cuando se mueve una tarjeta.
   * Ajusta las posiciones de las tarjetas afectadas para hacer espacio.
   */
  private async reorderCardsInSameColumn(
    columnId: string,
    sourcePosition: number,
    destinationPosition: number,
  ): Promise<void> {
    if (sourcePosition < destinationPosition) {
      // Moviendo hacia abajo: las tarjetas entre source y destination se mueven hacia arriba
      await this.cardModel
        .updateMany(
          {
            columnId: new Types.ObjectId(columnId),
            position: { $gt: sourcePosition, $lte: destinationPosition },
          },
          { $inc: { position: -1 } },
        )
        .exec();
    } else {
      // Moviendo hacia arriba: las tarjetas entre destination y source se mueven hacia abajo
      await this.cardModel
        .updateMany(
          {
            columnId: new Types.ObjectId(columnId),
            position: { $gte: destinationPosition, $lt: sourcePosition },
          },
          { $inc: { position: 1 } },
        )
        .exec();
    }
  }

  /**
   * Maneja el movimiento de tarjetas entre columnas diferentes.
   * Ajusta las posiciones en ambas columnas para hacer espacio.
   */
  private async moveCardBetweenColumns(
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourcePosition: number,
    destinationPosition: number,
  ): Promise<void> {
    // En la columna origen: movemos hacia arriba las tarjetas que estaban después
    await this.cardModel
      .updateMany(
        {
          columnId: new Types.ObjectId(sourceColumnId),
          position: { $gt: sourcePosition },
        },
        { $inc: { position: -1 } },
      )
      .exec();

    // En la columna destino: movemos hacia abajo las tarjetas que están en la posición destino o después
    await this.cardModel
      .updateMany(
        {
          columnId: new Types.ObjectId(destinationColumnId),
          position: { $gte: destinationPosition },
        },
        { $inc: { position: 1 } },
      )
      .exec();
  }

  /**
   * Obtiene un tablero completo con todas sus columnas y tarjetas.
   * Este es el método principal que usa el frontend para cargar todo el estado del tablero.
   */
  async getBoardWithData(boardId: string) {
    const board = await this.getBoardById(boardId);
    const columnas = await this.getColumnsByBoardId(boardId);

    // Para cada columna, obtenemos sus tarjetas
    const columnasConTarjetas = await Promise.all(
      columnas.map(async (columna) => {
        const columnId = (columna._id as Types.ObjectId).toString();
        const tarjetas = await this.getCardsByColumnId(columnId);
        return {
          ...columna.toObject(),
          cards: tarjetas,
        };
      }),
    );

    return {
      ...board.toObject(),
      columns: columnasConTarjetas,
    };
  }

  /**
   * Obtiene una columna específica por su ID.
   */
  async getColumn(columnId: string): Promise<Column> {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) {
      throw new NotFoundException(`No se encontró la columna con ID ${columnId}`);
    }
    return column;
  }

  /**
   * Obtiene una tarjeta específica por su ID.
   */
  async getCard(cardId: string): Promise<Card> {
    const card = await this.cardModel.findById(cardId).exec();
    if (!card) {
      throw new NotFoundException(`No se encontró la tarjeta con ID ${cardId}`);
    }
    return card;
  }
}
