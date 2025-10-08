import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardService } from '../board/board.service';
import { ExportBacklogDto } from './dto/export.dto';
import axios from 'axios';

/**
 * Interfaz para los datos de exportación de tarjetas
 */
interface CardExportData {
  id: string;
  title: string;
  description: string;
  column: string;
  createdAt: Date;
  [key: string]: any;
}

/**
 * Interfaz para el payload del webhook de N8N
 */
interface N8nWebhookPayload {
  boardId: string;
  boardTitle: string;
  recipientEmail: string;
  exportData: CardExportData[];
  exportDate: string;
  fields: string[];
}

/**
 * Servicio para manejar las exportaciones de tableros Kanban
 *
 * Proporciona funcionalidades para exportar tableros a CSV mediante N8N,
 * verificar el estado del sistema y obtener datos para la exportación.
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  constructor(private readonly boardService: BoardService) {}

  /**
   * Inicia el proceso de exportación de un tablero
   *
   * @param exportDto - Datos de la exportación
   * @returns Respuesta con el estado de la solicitud
   */
  async exportBacklog(exportDto: ExportBacklogDto): Promise<any> {
    try {
      this.logger.log(`Iniciando exportación del tablero: ${exportDto.boardId}`);

      if (!this.n8nWebhookUrl) {
        throw new Error('N8N_WEBHOOK_URL no está configurado');
      }

      // Payload simple para activar el workflow de N8N
      // El workflow de N8N obtendrá los datos via /api/export/columns
      const webhookPayload = {
        boardId: exportDto.boardId,
        recipientEmail: exportDto.recipientEmail,
        fields: exportDto.fields || ['id', 'title', 'description', 'column', 'createdAt'],
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Activando webhook de N8N: ${this.n8nWebhookUrl}`);

      const response = await axios.post(this.n8nWebhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      this.logger.log(`Respuesta del webhook N8N: ${response.status}`);

      return {
        status: 'success',
        message: 'Solicitud de exportación enviada correctamente',
        data: {
          boardId: exportDto.boardId,
          recipientEmail: exportDto.recipientEmail,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error al exportar tablero:', error);

      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Error al comunicarse con el servicio N8N',
            error: error.message,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        {
          status: 'error',
          message: 'Error al exportar el tablero',
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

  /**
   * Verifica el estado de salud del servicio N8N
   *
   * @returns Estado de conectividad con N8N
   */
  async checkN8nHealth(): Promise<any> {
    try {
      if (!this.n8nWebhookUrl) {
        return {
          status: 'error',
          message: 'URL del webhook N8N no configurada',
        };
      }

      const response = await axios.get(this.n8nWebhookUrl, {
        timeout: 5000,
        validateStatus: () => true,
      });

      return {
        status: 'ok',
        message: 'Servicio N8N accesible',
        webhookUrl: this.n8nWebhookUrl,
        responseStatus: response.status,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Servicio N8N no accesible',
        error: error.message,
      };
    }
  }

  /**
   * Obtiene todas las columnas y tarjetas de todos los tableros
   *
   * Este método es utilizado por el workflow de N8N para obtener los datos
   * que serán exportados en el archivo CSV.
   *
   * @returns Array con todas las columnas y sus tarjetas
   */
  async getAllColumns(): Promise<any[]> {
    try {
      // Obtener todos los tableros y sus columnas
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
      this.logger.error('Error al obtener columnas:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Error al obtener las columnas',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
