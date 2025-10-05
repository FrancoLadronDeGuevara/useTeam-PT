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

  async deleteColumn(id: string): Promise<void> {
    await this.cardModel.deleteMany({ columnId: id }).exec();

    const result = await this.columnModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }
  }

  async createCard(createCardDto: CreateCardDto): Promise<Card> {
    const column = await this.columnModel.findById(createCardDto.columnId).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${createCardDto.columnId} not found`);
    }

    if (createCardDto.position === undefined) {
      const lastCard = await this.cardModel
        .findOne({ columnId: createCardDto.columnId })
        .sort({ position: -1 })
        .exec();
      createCardDto.position = lastCard ? lastCard.position + 1 : 0;
    }

    const card = new this.cardModel(createCardDto);
    return card.save();
  }

  async getCardsByColumnId(columnId: string): Promise<Card[]> {
    return this.cardModel.find({ columnId }).sort({ position: 1 }).exec();
  }

  async getCardsByBoardId(boardId: string): Promise<Card[]> {
    const columns = await this.columnModel.find({ boardId }).exec();
    const columnIds = columns.map((col) => col._id);
    return this.cardModel
      .find({ columnId: { $in: columnIds } })
      .sort({ position: 1 })
      .exec();
  }

  async updateCard(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardModel.findByIdAndUpdate(id, updateCardDto, { new: true }).exec();
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return card;
  }

  async deleteCard(id: string): Promise<void> {
    const result = await this.cardModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
  }

  async moveCard(moveCardDto: MoveCardDto): Promise<Card> {
    const { cardId, sourceColumnId, destinationColumnId, sourcePosition, destinationPosition } =
      moveCardDto;

    const card = await this.cardModel.findById(cardId).exec();
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    if (sourceColumnId === destinationColumnId) {
      await this.reorderCardsInSameColumn(sourceColumnId, sourcePosition, destinationPosition);
    } else {
      await this.moveCardBetweenColumns(
        cardId,
        sourceColumnId,
        destinationColumnId,
        sourcePosition,
        destinationPosition,
      );
    }

    card.columnId = new Types.ObjectId(destinationColumnId);
    card.position = destinationPosition;
    return card.save();
  }
  private async reorderCardsInSameColumn(
    columnId: string,
    sourcePosition: number,
    destinationPosition: number,
  ): Promise<void> {
    if (sourcePosition < destinationPosition) {
      await this.cardModel
        .updateMany(
          {
            columnId,
            position: { $gt: sourcePosition, $lte: destinationPosition },
          },
          { $inc: { position: -1 } },
        )
        .exec();
    } else {
      await this.cardModel
        .updateMany(
          {
            columnId,
            position: { $gte: destinationPosition, $lt: sourcePosition },
          },
          { $inc: { position: 1 } },
        )
        .exec();
    }
  }

  private async moveCardBetweenColumns(
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourcePosition: number,
    destinationPosition: number,
  ): Promise<void> {
    await this.cardModel
      .updateMany(
        {
          columnId: sourceColumnId,
          position: { $gt: sourcePosition },
        },
        { $inc: { position: -1 } },
      )
      .exec();

    await this.cardModel
      .updateMany(
        {
          columnId: destinationColumnId,
          position: { $gte: destinationPosition },
        },
        { $inc: { position: 1 } },
      )
      .exec();
  }

  async getBoardWithData(boardId: string) {
    const board = await this.getBoardById(boardId);
    const columns = await this.getColumnsByBoardId(boardId);

    const columnsWithCards = await Promise.all(
      columns.map(async (column) => {
        const columnId = (column._id as Types.ObjectId).toString();
        const cards = await this.getCardsByColumnId(columnId);
        return {
          ...column.toObject(),
          cards,
        };
      }),
    );

    return {
      ...board.toObject(),
      columns: columnsWithCards,
    };
  }
}
