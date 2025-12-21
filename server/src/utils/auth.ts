import { Request } from 'express';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthContext {
  user?: JWTPayload;
}

export const getAuthContext = (req: Request): AuthContext => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {};
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = verifyToken(token);
    return { user: payload };
  } catch (error) {
    return {};
  }
};

export const requireAuth = (context: AuthContext): JWTPayload => {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
};

export const requireAdmin = (context: AuthContext): JWTPayload => {
  const user = requireAuth(context);
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  return user;
};






