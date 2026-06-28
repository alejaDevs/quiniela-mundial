import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // eslint-disable-next-line no-console
  console.error('[ErrorHandler]', error);

  const message: string =
    error instanceof Error ? error.message : 'Unexpected server error';

  res.status(500).json({ message });
};
