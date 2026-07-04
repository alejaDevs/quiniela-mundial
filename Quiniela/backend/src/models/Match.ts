import { Schema, model, Model, Document } from "mongoose";

export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export interface IMatchTeam {
  name: string;
  countryCode: string;
}

export interface IMatch {
  homeTeam: IMatchTeam;
  awayTeam: IMatchTeam;
  stage: MatchStage;
  groupLabel: string | null;
  kickoffDate: Date;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  apiFootballId: number | null;
  stadium: string | null;
  city: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMatchDocument extends IMatch, Document {}

const TeamSchema: Schema<IMatchTeam> = new Schema<IMatchTeam>(
  {
    name: { type: String, required: true, trim: true },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 6,
    },
  },
  { _id: false },
);

const MatchSchema: Schema<IMatchDocument> = new Schema<IMatchDocument>(
  {
    homeTeam: { type: TeamSchema, required: true },
    awayTeam: { type: TeamSchema, required: true },
    stage: {
      type: String,
      required: true,
      enum: [
        "group",
        "round_of_32",
        "round_of_16",
        "quarter_final",
        "semi_final",
        "third_place",
        "final",
      ],
    },
    groupLabel: { type: String, default: null, trim: true, maxlength: 4 },
    kickoffDate: { type: Date, required: true },
    homeScore: { type: Number, default: null, min: 0 },
    awayScore: { type: Number, default: null, min: 0 },
    isFinished: { type: Boolean, required: true, default: false },
    apiFootballId: { type: Number, default: null },
    stadium: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

MatchSchema.index({ kickoffDate: 1 });
MatchSchema.index({ apiFootballId: 1 }, { sparse: true });

export const MatchModel: Model<IMatchDocument> = model<IMatchDocument>(
  "Match",
  MatchSchema,
);
