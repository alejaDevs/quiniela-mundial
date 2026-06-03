import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from '../types/Index';

const getSecret = (): Secret => {
  const secret: string | undefined = process.env.JWT_SECRET;
  if (secret === undefined || secret.length === 0) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const getExpiresIn = (): SignOptions['expiresIn'] => {
  const expiresIn: string | undefined = process.env.JWT_EXPIRES_IN;
  return (expiresIn ?? '7d') as SignOptions['expiresIn'];
};

export const signToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: getExpiresIn() });
};

export const verifyToken = (token: string): IJwtPayload => {
  const decoded: unknown = jwt.verify(token, getSecret());
  if (
    typeof decoded === 'object' &&
    decoded !== null &&
    'userId' in decoded &&
    'isAdmin' in decoded
  ) {
    const candidate: Record<string, unknown> = decoded as Record<
      string,
      unknown
    >;
    if (
      typeof candidate.userId === 'string' &&
      typeof candidate.isAdmin === 'boolean'
    ) {
      return { userId: candidate.userId, isAdmin: candidate.isAdmin };
    }
  }
  throw new Error('Invalid token payload');
};
