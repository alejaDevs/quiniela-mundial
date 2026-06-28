import bcrypt from 'bcrypt';

const getSaltRounds = (): number => {
  const raw: string | undefined = process.env.BCRYPT_SALT_ROUNDS;
  const parsed: number = raw === undefined ? 10 : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
};

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, getSaltRounds());
};

export const verifyPassword = async (
  plain: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
