import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Esquema de Tarjeta
 *
 * Representa una tarjeta dentro de una columna en un tablero.
 * Usa ObjectId para columnId para mantener la integridad referencial con MongoDB.
 * Se serializa automáticamente a string cuando se envía al frontend.
 */
@Schema({ timestamps: true })
export class Card extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  position: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);

// Índice compuesto para consultas eficientes por columna y posición
CardSchema.index({ columnId: 1, position: 1 });
