import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardService } from './board.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateColumnDto,
  UpdateColumnDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
} from './dto/board.dto';

/**
 * Controlador REST para operaciones de tableros.
 *
 * Proporciona endpoints HTTP para todas las operaciones CRUD
 * de tableros, columnas y tarjetas.
 */
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // ============ ENDPOINTS DE TABLEROS ============

  @Post()
  createBoard(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.createBoard(createBoardDto);
  }

  @Get()
  getAllBoards() {
    return this.boardService.getAllBoards();
  }

  @Get(':id')
  getBoardById(@Param('id') id: string) {
    return this.boardService.getBoardById(id);
  }

  @Get(':id/full')
  getBoardWithData(@Param('id') id: string) {
    return this.boardService.getBoardWithData(id);
  }

  @Put(':id')
  updateBoard(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.updateBoard(id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBoard(@Param('id') id: string) {
    return this.boardService.deleteBoard(id);
  }

  // ============ ENDPOINTS DE COLUMNAS ============

  @Post('columns')
  createColumn(@Body() createColumnDto: CreateColumnDto) {
    return this.boardService.createColumn(createColumnDto);
  }

  @Get(':boardId/columns')
  getColumnsByBoardId(@Param('boardId') boardId: string) {
    return this.boardService.getColumnsByBoardId(boardId);
  }

  @Put('columns/:id')
  updateColumn(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.boardService.updateColumn(id, updateColumnDto);
  }

  @Delete('columns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteColumn(@Param('id') id: string) {
    return this.boardService.deleteColumn(id);
  }

  // ============ ENDPOINTS DE TARJETAS ============

  @Post('cards')
  createCard(@Body() createCardDto: CreateCardDto) {
    return this.boardService.createCard(createCardDto);
  }

  @Get('columns/:columnId/cards')
  getCardsByColumnId(@Param('columnId') columnId: string) {
    return this.boardService.getCardsByColumnId(columnId);
  }

  @Get(':boardId/cards')
  getCardsByBoardId(@Param('boardId') boardId: string) {
    return this.boardService.getCardsByBoardId(boardId);
  }

  @Put('cards/:id')
  updateCard(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.boardService.updateCard(id, updateCardDto);
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCard(@Param('id') id: string) {
    return this.boardService.deleteCard(id);
  }

  @Post('cards/move')
  moveCard(@Body() moveCardDto: MoveCardDto) {
    return this.boardService.moveCard(moveCardDto);
  }

  // ============ ENDPOINTS DE UTILIDADES ============

  @Delete('cards/cleanup')
  async cleanupCards() {
    return this.boardService.deleteAllCards();
  }
}
