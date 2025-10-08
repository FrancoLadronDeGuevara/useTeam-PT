import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardService } from '../board/board.service';
import { ExportBacklogDto } from './dto/export.dto';
import axios from 'axios';

interface CardExportData {
  id: string;
  title: string;
  description: string;
  column: string;
  createdAt: Date;
  [key: string]: any;
}

interface N8nWebhookPayload {
  boardId: string;
  boardTitle: string;
  recipientEmail: string;
  exportData: CardExportData[];
  exportDate: string;
  fields: string[];
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  constructor(private readonly boardService: BoardService) {}

  async exportBacklog(exportDto: ExportBacklogDto): Promise<any> {
    try {
      this.logger.log(`Starting backlog export for board: ${exportDto.boardId}`);

      if (!this.n8nWebhookUrl) {
        throw new Error('N8N_WEBHOOK_URL is not configured');
      }

      // Simple webhook payload to trigger N8N workflow
      // The N8N workflow will fetch the data itself via /api/export/columns
      const webhookPayload = {
        boardId: exportDto.boardId,
        recipientEmail: exportDto.recipientEmail,
        fields: exportDto.fields || ['id', 'title', 'description', 'column', 'createdAt'],
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Triggering N8N webhook: ${this.n8nWebhookUrl}`);

      const response = await axios.post(this.n8nWebhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      this.logger.log(`N8N webhook response: ${response.status}`);

      return {
        status: 'success',
        message: 'Export request sent successfully',
        data: {
          boardId: exportDto.boardId,
          recipientEmail: exportDto.recipientEmail,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error exporting backlog:', error);

      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Failed to communicate with N8N service',
            error: error.message,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to export backlog',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private prepareExportData(boardData: any, fields?: string[]): CardExportData[] {
    const exportData: CardExportData[] = [];

    for (const column of boardData.columns) {
      for (const card of column.cards) {
        const cardData: any = {
          id: card._id.toString(),
          title: card.title,
          description: card.description || '',
          column: column.title,
          createdAt: card.createdAt,
        };

        if (fields && fields.length > 0) {
          const filteredData: any = {};
          fields.forEach((field) => {
            if (cardData[field] !== undefined) {
              filteredData[field] = cardData[field];
            }
          });
          exportData.push(filteredData);
        } else {
          exportData.push(cardData);
        }
      }
    }

    return exportData;
  }

  async checkN8nHealth(): Promise<any> {
    try {
      if (!this.n8nWebhookUrl) {
        return {
          status: 'error',
          message: 'N8N webhook URL not configured',
        };
      }

      const response = await axios.get(this.n8nWebhookUrl, {
        timeout: 5000,
        validateStatus: () => true,
      });

      return {
        status: 'ok',
        message: 'N8N service is reachable',
        webhookUrl: this.n8nWebhookUrl,
        responseStatus: response.status,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'N8N service is not reachable',
        error: error.message,
      };
    }
  }

  async getAllColumns(): Promise<any[]> {
    try {
      // Obtener todos los boards y sus columnas
      const boards = await this.boardService.getAllBoards();

      const allColumns: any[] = [];

      for (const board of boards) {
        const boardData = await this.boardService.getBoardWithData((board as any)._id.toString());

        for (const column of boardData.columns) {
          allColumns.push({
            _id: column._id,
            name: column.title,
            boardId: (board as any)._id,
            boardTitle: (board as any).title,
            cards: column.cards.map((card: any) => ({
              _id: card._id,
              title: card.title,
              description: card.description || '',
              createdAt: card.createdAt,
              updatedAt: card.updatedAt,
            })),
          });
        }
      }

      return allColumns;
    } catch (error) {
      this.logger.error('Error getting all columns:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get columns',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async confirmExport(confirmDto: any): Promise<any> {
    try {
      this.logger.log(`Export confirmation received: ${JSON.stringify(confirmDto)}`);

      // Aquí puedes agregar lógica adicional como:
      // - Guardar el estado de la exportación en base de datos
      // - Enviar notificaciones
      // - Actualizar estadísticas

      return {
        status: 'success',
        message: 'Export confirmation processed',
        timestamp: new Date(),
        details: confirmDto,
      };
    } catch (error) {
      this.logger.error('Error processing export confirmation:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to process export confirmation',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
