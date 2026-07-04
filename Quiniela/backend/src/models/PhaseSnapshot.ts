import { Schema, model, Model, Document } from 'mongoose';

export interface IPhaseSnapshotEntry {
  userId: string;
  username: string;
  displayName: string;
  totalPoints: number;
  rank: number;
  predictionsCount: number;
  predictionsScored: number;
}

export interface IPhaseSnapshot {
  phase: string;
  phaseName: string;
  totalMatches: number;
  entries: IPhaseSnapshotEntry[];
  createdAt: Date;
}

export interface IPhaseSnapshotDocument extends IPhaseSnapshot, Document {}

const EntrySchema = new Schema<IPhaseSnapshotEntry>(
  {
    userId: String,
    username: String,
    displayName: String,
    totalPoints: Number,
    rank: Number,
    predictionsCount: Number,
    predictionsScored: Number,
  },
  { _id: false }
);

const PhaseSnapshotSchema = new Schema<IPhaseSnapshotDocument>(
  {
    phase: { type: String, required: true },
    phaseName: { type: String, required: true },
    totalMatches: { type: Number, required: true },
    entries: [EntrySchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PhaseSnapshotSchema.index({ phase: 1 }, { unique: true });

export const PhaseSnapshotModel: Model<IPhaseSnapshotDocument> =
  model<IPhaseSnapshotDocument>('PhaseSnapshot', PhaseSnapshotSchema);
