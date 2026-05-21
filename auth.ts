import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { getIsMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { dbService } from '../services/storage.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    avatar: string;
  };
}

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  let token = '';

  // Get token from header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, login required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    res.status(401).json({ success: false, message: 'Session expired or invalid, please login again' });
    return;
  }

  try {
    let userDetails = null;

    if (getIsMongoConnected()) {
      const userDoc = await User.findById(decoded.id).select('-password');
      if (userDoc) {
        userDetails = {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          avatar: userDoc.avatar,
        };
      }
    } else {
      const dbUser = await dbService.getUserById(decoded.id);
      if (dbUser) {
        userDetails = {
          id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          avatar: dbUser.avatar,
        };
      }
    }

    if (!userDetails) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = userDetails as any;
    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
}

export function authorize(...roles: Array<'admin' | 'member'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`,
      });
      return;
    }
    next();
  };
}
