import { getToken } from 'next-auth/jwt';

export const isAuth = async (req, res, next) => {
  try {
    const token = await getToken({ req, secret: process.env.JWT_AUTH });
    
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    req.user = token;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
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