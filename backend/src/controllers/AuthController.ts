import { Request, Response, NextFunction } from 'express';
import { UserModel, IUserDocument } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/PasswordHasher';
import { signToken } from '../utils/JwtHelper';

interface IRegisterBody {
  username: string;
  password: string;
  displayName: string;
}

interface ILoginBody {
  username: string;
  password: string;
}

const isString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

const parseRegisterBody = (body: unknown): IRegisterBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  if (
    !isString(candidate.username) ||
    !isString(candidate.password) ||
    !isString(candidate.displayName)
  ) {
    return null;
  }
  return {
    username: candidate.username.trim(),
    password: candidate.password,
    displayName: candidate.displayName.trim()
  };
};

const parseLoginBody = (body: unknown): ILoginBody | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const candidate: Record<string, unknown> = body as Record<string, unknown>;
  if (!isString(candidate.username) || !isString(candidate.password)) {
    return null;
  }
  return { username: candidate.username.trim(), password: candidate.password };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body: IRegisterBody | null = parseRegisterBody(req.body);
    if (body === null) {
      res.status(400).json({ message: 'username, password and displayName are required' });
      return;
    }

    const existing: IUserDocument | null = await UserModel.findOne({
      username: body.username
    });
    if (existing !== null) {
      res.status(409).json({ message: 'Username already in use' });
      return;
    }

    const passwordHash: string = await hashPassword(body.password);
    const created: IUserDocument = await UserModel.create({
      username: body.username,
      passwordHash,
      displayName: body.displayName,
      isAdmin: false
    });

    const token: string = signToken({
      userId: created.id,
      isAdmin: created.isAdmin
    });

    res.status(201).json({
      token,
      user: {
        id: created.id,
        username: created.username,
        displayName: created.displayName,
        isAdmin: created.isAdmin
      }
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body: ILoginBody | null = parseLoginBody(req.body);
    if (body === null) {
      res.status(400).json({ message: 'username and password are required' });
      return;
    }

    const user: IUserDocument | null = await UserModel.findOne({
      username: body.username
    });
    if (user === null) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const matches: boolean = await verifyPassword(body.password, user.passwordHash);
    if (!matches) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token: string = signToken({
      userId: user.id,
      isAdmin: user.isAdmin
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isAdmin: user.isAdmin
      }
    });
  } catch (error: unknown) {
    next(error);
  }
};
