import { Schema, model, Model, Document, Types } from 'mongoose';

export interface IPrediction {
  user: Types.ObjectId;
  match: Types.ObjectId;
  predictedHomeScore: number;
  predictedAwayScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPredictionDocument extends IPrediction, Document {}

const PredictionSchema: Schema<IPredictionDocument> =
  new Schema<IPredictionDocument>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },
      match: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
      },
      predictedHomeScore: { type: Number, required: true, min: 0, max: 99 },
      predictedAwayScore: { type: Number, required: true, min: 0, max: 99 }
    },
    { timestamps: true }
  );

PredictionSchema.index({ user: 1, match: 1 }, { unique: true });

export const PredictionModel: Model<IPredictionDocument> =
  model<IPredictionDocument>('Prediction', PredictionSchema);
