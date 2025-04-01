import { getToken } from 'next-auth/jwt';
import { Permissions } from '../utils/permissions';

export const isAuth = async (req, res) => {
  try {
    const token = await getToken({ req, secret: process.env.JWT_AUTH });

    if (!token) {
      res.status(401).json({ message: 'Token is required' });
      return false; // Return false to indicate authentication failure
    }

    req.user = token;
    return true; // Return true to indicate authentication success
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return false; // Return false to indicate authentication failure
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    const token = await getToken({ req, secret: process.env.JWT_AUTH });
    
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    if (token.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = token;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check specific roles
export const hasRole = (roles) => async (req, res, next) => {
  try {
    const token = await getToken({ req, secret: process.env.JWT_AUTH });
    
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    if (!roles.includes(token.role)) {
      return res.status(403).json({ message: 'Insufficient role permissions' });
    }

    req.user = token;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check specific permissions
export const hasPermission = (permission) => async (req, res) => {
  try {
    const token = await getToken({ req, secret: process.env.JWT_AUTH });

    if (!token) {
      res.status(401).json({ message: 'Token is required' });
      return false; // Return false to indicate permission check failure
    }

    if (!token.permissions || !token.permissions.includes(permission)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return false; // Return false to indicate permission check failure
    }

    req.user = token;
    return true; // Return true to indicate permission check success
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return false; // Return false to indicate permission check failure
  }
}; 