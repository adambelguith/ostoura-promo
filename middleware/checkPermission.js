import { getSession } from 'next-auth/react';

export default function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has required permissions
    const userPermissions = session.user.permissions || [];
    const hasRequiredPermissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions.every(permission => userPermissions.includes(permission))
      : userPermissions.includes(requiredPermissions);

    if (!hasRequiredPermissions) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    return next();
  };
} 