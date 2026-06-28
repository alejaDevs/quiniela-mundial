import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/JwtHelper';
import { IJwtPayload } from '../types/Index';

const extractBearerToken = (header: string | undefined): string | null => {
  if (header === undefined) {
    return null;
  }
  const parts: string[] = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1].length === 0) {
    return null;
  }
  return parts[1];
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string | null = extractBearerToken(req.headers.authorization);
  if (token === null) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const payload: IJwtPayload = verifyToken(token);
    req.authUser = { userId: payload.userId, isAdmin: payload.isAdmin };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.authUser === undefined || !req.authUser.isAdmin) {
    res.status(403).json({ message: 'Admin privileges required' });
    return;
  }
  next();
};
