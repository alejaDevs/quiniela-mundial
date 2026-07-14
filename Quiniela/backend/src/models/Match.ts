import { Schema, model, Model, Document, Types } from "mongoose";

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
  // Resultado final (posterior al minuto 90: tiempo extra/penales), usado
  // únicamente para determinar el ganador que avanza de ronda. homeScore/
  // awayScore siguen siendo el marcador de 90' con el que se puntúan los
  // pronósticos.
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  // Ganador explícito cuando finalHomeScore/finalAwayScore quedan empatados
  // (ej. definición por penales).
  winnerSide: 'home' | 'away' | null;
  apiFootballId: number | null;
  stadium: string | null;
  city: string | null;
  nextMatchId: Types.ObjectId | null;
  nextMatchSlot: 'home' | 'away' | null;
  loserNextMatchId: Types.ObjectId | null;
  loserNextMatchSlot: 'home' | 'away' | null;
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
    finalHomeScore: { type: Number, default: null, min: 0 },
    finalAwayScore: { type: Number, default: null, min: 0 },
    winnerSide: { type: String, enum: ['home', 'away'], default: null },
    apiFootballId: { type: Number, default: null },
    stadium: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    nextMatchId: { type: Schema.Types.ObjectId, ref: 'Match', default: null },
    nextMatchSlot: { type: String, enum: ['home', 'away'], default: null },
    loserNextMatchId: { type: Schema.Types.ObjectId, ref: 'Match', default: null },
    loserNextMatchSlot: { type: String, enum: ['home', 'away'], default: null },
  },
  { timestamps: true },
);

MatchSchema.index({ kickoffDate: 1 });
MatchSchema.index({ apiFootballId: 1 }, { sparse: true });

export const MatchModel: Model<IMatchDocument> = model<IMatchDocument>(
  "Match",
  MatchSchema,
);
