export interface IBoard {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IColumn {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICard {
  _id: string;
  title: string;
  description: string;
  columnId: string | { _id: string; title: string };
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IColumnWithCards extends IColumn {
  cards: ICard[];
}

export interface IBoardWithData extends IBoard {
  columns: IColumnWithCards[];
}

export interface CreateBoardDto {
  title: string;
  description?: string;
}

export interface CreateColumnDto {
  title: string;
  boardId: string;
  position?: number;
}

export interface CreateCardDto {
  title: string;
  description?: string;
  columnId: string;
  position?: number;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
}

export interface MoveCardDto {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourcePosition: number;
  destinationPosition: number;
}

export interface ExportBacklogDto {
  boardId: string;
  recipientEmail: string;
  fields?: string[];
}

export interface UserConnectionData {
  userId: string;
  totalUsers: number;
}

export interface CardMovedData {
  card: ICard;
  moveData: MoveCardDto;
}
