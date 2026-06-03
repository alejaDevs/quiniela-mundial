import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/Database';
import { AuthRoutes } from './routes/AuthRoutes';
import { MatchRoutes } from './routes/MatchRoutes';
import { PredictionRoutes } from './routes/PredictionRoutes';
import { LeaderboardRoutes } from './routes/LeaderboardRoutes';
import { errorHandler } from './middlewares/ErrorMiddleware';

dotenv.config();

const buildApp = (): Application => {
  const app: Application = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', AuthRoutes);
  app.use('/api/matches', MatchRoutes);
  app.use('/api/predictions', PredictionRoutes);
  app.use('/api/leaderboard', LeaderboardRoutes);

  app.use(errorHandler);

  return app;
};

const startServer = async (): Promise<void> => {
  const port: number = Number(process.env.PORT ?? 4000);
  const mongoUri: string = process.env.MONGODB_URI ?? '';

  await connectDatabase(mongoUri);

  const app: Application = buildApp();

  app.listen(port, (): void => {
    // eslint-disable-next-line no-console
    console.log(`[Server] Listening on port ${port}`);
  });
};

void startServer();

export { buildApp };
