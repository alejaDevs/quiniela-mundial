import { IUser } from '../types/Index';

interface IRawUser {
  _id?: string;
  id?: string;
  username?: string;
  displayName?: string;
  isAdmin?: boolean;
}

export const adaptUserFromApi = (raw: unknown): IUser => {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid user payload');
  }
  const data: IRawUser = raw as IRawUser;
  const id: string | undefined = data.id ?? data._id;
  if (
    typeof id !== 'string' ||
    typeof data.username !== 'string' ||
    typeof data.displayName !== 'string' ||
    typeof data.isAdmin !== 'boolean'
  ) {
    throw new Error('Invalid user payload');
  }
  return {
    id,
    username: data.username,
    displayName: data.displayName,
    isAdmin: data.isAdmin
  };
};
