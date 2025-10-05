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

      const boardData = await this.boardService.getBoardWithData(exportDto.boardId);

      const exportData = this.prepareExportData(boardData, exportDto.fields);

      if (!this.n8nWebhookUrl) {
        throw new Error('N8N_WEBHOOK_URL is not configured');
      }

      const webhookPayload: N8nWebhookPayload = {
        boardId: exportDto.boardId,
        boardTitle: boardData.title,
        recipientEmail: exportDto.recipientEmail,
        exportData: exportData,
        exportDate: new Date().toISOString(),
        fields: exportDto.fields || ['id', 'title', 'description', 'column', 'createdAt'],
      };

      this.logger.log(`Sending data to N8N webhook: ${this.n8nWebhookUrl}`);

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
          totalCards: exportData.length,
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
}
