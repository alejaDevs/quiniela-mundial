import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { MatchModel } from "../models/Match";
import { resolveMatchWinner, MatchSide } from "../utils/MatchWinner";

dotenv.config();

// Vincula los partidos del cuadro según la estructura del torneo.

// Cada entrada usa kickoffDate (GT) para identificar el partido fuente
// y el partido destino, más el slot (home/away) que ocupa el ganador.
//
// Estructura (hora GT):
//   R16 Llave 1 (2026-07-04 15:00) → winner → QF1/M97  home (2026-07-09 14:00)
//   R16 Llave 2 (2026-07-04 11:00) → winner → QF1/M97  away
//   R16 Llave 3 (2026-07-05 14:00) → winner → QF3/M99  home (2026-07-11 14:00)
//   R16 Llave 4 (2026-07-05 16:00) → winner → QF3/M99  away
//   R16 Llave 5 (2026-07-06 12:00) → winner → QF2/M98  home (2026-07-10 18:00)
//   R16 Llave 6 (2026-07-06 15:00) → winner → QF2/M98  away
//   R16 Llave 7 (2026-07-07 10:00) → winner → QF4/M100 home (2026-07-11 18:00)
//   R16 Llave 8 (2026-07-07 11:00) → winner → QF4/M100 away
//   QF1/M97  (2026-07-09 14:00)    → winner → SF1/M101 home (2026-07-14 13:00)
//   QF2/M98  (2026-07-10 18:00)    → winner → SF1/M101 away
//   QF3/M99  (2026-07-11 14:00)    → winner → SF2/M102 home (2026-07-15 13:00)
//   QF4/M100 (2026-07-11 18:00)    → winner → SF2/M102 away
//   SF1/M101 (2026-07-14 13:00)    → winner → Final/M104 home (2026-07-19 13:00)
//                                  → loser  → 3rd/M103  home (2026-07-18 14:00)
//   SF2/M102 (2026-07-15 13:00)    → winner → Final/M104 away
//                                  → loser  → 3rd/M103  away

// Seeds were created with Guatemala UTC-6, so kickoffDate stored = local + 6h
const gt = (dateStr: string, gtTime: string): Date =>
  new Date(`${dateStr}T${gtTime}:00-06:00`);

interface ILink {
  sourceKickoff: Date;
  nextKickoff: Date;
  nextSlot: "home" | "away";
  loserNextKickoff?: Date;
  loserNextSlot?: "home" | "away";
}

const LINKS: ILink[] = [
  // R16 → QF
  {
    sourceKickoff: gt("2026-07-04", "15:00"),
    nextKickoff: gt("2026-07-09", "14:00"),
    nextSlot: "home",
  }, // Llave 1 → QF1/M97
  {
    sourceKickoff: gt("2026-07-04", "11:00"),
    nextKickoff: gt("2026-07-09", "14:00"),
    nextSlot: "away",
  }, // Llave 2 → QF1/M97
  {
    sourceKickoff: gt("2026-07-05", "14:00"),
    nextKickoff: gt("2026-07-11", "14:00"),
    nextSlot: "home",
  }, // Llave 3 → QF3/M99
  {
    sourceKickoff: gt("2026-07-05", "16:00"),
    nextKickoff: gt("2026-07-11", "14:00"),
    nextSlot: "away",
  }, // Llave 4 → QF3/M99
  {
    sourceKickoff: gt("2026-07-06", "12:00"),
    nextKickoff: gt("2026-07-10", "18:00"),
    nextSlot: "home",
  }, // Llave 5 → QF2/M98
  {
    sourceKickoff: gt("2026-07-06", "15:00"),
    nextKickoff: gt("2026-07-10", "18:00"),
    nextSlot: "away",
  }, // Llave 6 → QF2/M98
  {
    sourceKickoff: gt("2026-07-07", "10:00"),
    nextKickoff: gt("2026-07-11", "18:00"),
    nextSlot: "home",
  }, // Llave 7 → QF4/M100
  {
    sourceKickoff: gt("2026-07-07", "11:00"),
    nextKickoff: gt("2026-07-11", "18:00"),
    nextSlot: "away",
  }, // Llave 8 → QF4/M100
  // QF → SF
  {
    sourceKickoff: gt("2026-07-09", "14:00"),
    nextKickoff: gt("2026-07-14", "13:00"),
    nextSlot: "home",
  }, // QF1/M97  → SF1/M101
  {
    sourceKickoff: gt("2026-07-10", "18:00"),
    nextKickoff: gt("2026-07-14", "13:00"),
    nextSlot: "away",
  }, // QF2/M98  → SF1/M101
  {
    sourceKickoff: gt("2026-07-11", "14:00"),
    nextKickoff: gt("2026-07-15", "13:00"),
    nextSlot: "home",
  }, // QF3/M99  → SF2/M102
  {
    sourceKickoff: gt("2026-07-11", "18:00"),
    nextKickoff: gt("2026-07-15", "13:00"),
    nextSlot: "away",
  }, // QF4/M100 → SF2/M102
  // SF → Final + 3rd Place
  {
    sourceKickoff: gt("2026-07-14", "13:00"),
    nextKickoff: gt("2026-07-19", "13:00"),
    nextSlot: "home",
    loserNextKickoff: gt("2026-07-18", "14:00"),
    loserNextSlot: "home",
  },
  {
    sourceKickoff: gt("2026-07-15", "13:00"),
    nextKickoff: gt("2026-07-19", "13:00"),
    nextSlot: "away",
    loserNextKickoff: gt("2026-07-18", "14:00"),
    loserNextSlot: "away",
  },
];

export const linkBracketMatches = async (): Promise<void> => {
  let linked = 0;

  for (const link of LINKS) {
    const [source, next] = await Promise.all([
      MatchModel.findOne({ kickoffDate: link.sourceKickoff }),
      MatchModel.findOne({ kickoffDate: link.nextKickoff }),
    ]);

    if (!source || !next) {
      console.warn(
        `[LinkBracket] Partido no encontrado: source=${link.sourceKickoff.toISOString()} next=${link.nextKickoff.toISOString()}`,
      );
      continue;
    }

    const update: Record<string, unknown> = {
      nextMatchId: next._id,
      nextMatchSlot: link.nextSlot,
    };

    if (link.loserNextKickoff) {
      const loserNext = await MatchModel.findOne({
        kickoffDate: link.loserNextKickoff,
      });
      if (loserNext) {
        update.loserNextMatchId = loserNext._id;
        update.loserNextMatchSlot = link.loserNextSlot;
      }
    }

    await MatchModel.findByIdAndUpdate(source._id, update);
    linked++;
  }

  console.log(`[LinkBracket] ${linked}/${LINKS.length} partidos vinculados`);
};

// Propaga los ganadores de partidos ya terminados que aún no se reflejan en
// la siguiente ronda. Debe ejecutarse DESPUÉS de linkBracketMatches().
const propagateExistingWinners = async (): Promise<void> => {
  const finished = await MatchModel.find({
    isFinished: true,
    nextMatchId: { $ne: null },
    homeScore: { $ne: null },
    awayScore: { $ne: null },
  });

  let propagated = 0;

  for (const match of finished) {
    const winnerSide: MatchSide | null = resolveMatchWinner(match);

    if (winnerSide === null) {
      console.warn(
        `[LinkBracket] Partido empatado en 90' sin resultado final cargado, se omite propagación: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      );
      continue;
    }

    const winner = winnerSide === "home" ? match.homeTeam : match.awayTeam;
    const loser = winnerSide === "home" ? match.awayTeam : match.homeTeam;

    const winnerField =
      match.nextMatchSlot === "home" ? "homeTeam" : "awayTeam";
    await MatchModel.findByIdAndUpdate(match.nextMatchId, {
      [winnerField]: winner,
    });

    if (match.loserNextMatchId && match.loserNextMatchSlot) {
      const loserField =
        match.loserNextMatchSlot === "home" ? "homeTeam" : "awayTeam";
      await MatchModel.findByIdAndUpdate(match.loserNextMatchId, {
        [loserField]: loser,
      });
    }

    console.log(
      `[LinkBracket] Ganador propagado: ${winner.name} → ${match.nextMatchSlot} del siguiente partido`,
    );
    propagated++;
  }

  console.log(`[LinkBracket] ${propagated} ganadores propagados`);
};

const run = async (): Promise<void> => {
  const mongoUri: string = process.env.MONGODB_URI ?? "";
  await connectDatabase(mongoUri);
  await linkBracketMatches();
  await propagateExistingWinners();
  await disconnectDatabase();
};

run().catch((error: unknown): void => {
  console.error("[LinkBracket] Error:", error);
  process.exit(1);
});
