import { Request, Response, NextFunction } from 'express';
import { UserModel, IUserDocument } from '../models/User';

interface IUserListEntry {
  id: string;
  username: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
}

// Usuarios creados antes de que existiera este campo no lo tienen guardado
// en Mongo (undefined, no false), así que se tratan como activos por defecto
// — igual que ya lo hacen las consultas del leaderboard (isActive: { $ne: false }).
const toListEntry = (user: IUserDocument): IUserListEntry => ({
  id: String(user._id),
  username: user.username,
  displayName: user.displayName,
  isActive: user.isActive ?? true,
  createdAt: user.createdAt
});

export const listUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users: IUserDocument[] = await UserModel.find({ isAdmin: false })
      .sort({ displayName: 1 })
      .lean<IUserDocument[]>();
    res.status(200).json({ users: users.map(toListEntry) });
  } catch (error: unknown) {
    next(error);
  }
};

interface ISetUserActiveBody {
  isActive: boolean;
}

const parseSetUserActiveBody = (body: unknown): ISetUserActiveBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  if (typeof candidate.isActive !== 'boolean') {
    return null;
  }
  return { isActive: candidate.isActive };
};

export const setUserActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body: ISetUserActiveBody | null = parseSetUserActiveBody(req.body);
    if (body === null) {
      res.status(400).json({ message: 'isActive must be a boolean' });
      return;
    }

    const user: IUserDocument | null = await UserModel.findById(req.params.id);
    if (user === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user.isAdmin) {
      res.status(400).json({ message: 'No se puede ocultar a un administrador' });
      return;
    }

    user.isActive = body.isActive;
    await user.save();

    res.status(200).json({ user: toListEntry(user) });
  } catch (error: unknown) {
    next(error);
  }
};
