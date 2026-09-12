import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        userRoles: Array<{
          role: {
            roleName: string;
          };
        }>;
      };
    }
  }
}
