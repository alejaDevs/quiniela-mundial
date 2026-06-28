export interface IJwtPayload {
  userId: string;
  isAdmin: boolean;
}

export interface IAuthenticatedRequestUser {
  userId: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: IAuthenticatedRequestUser;
    }
  }
}

export {};
