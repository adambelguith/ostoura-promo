// Define all possible actions
export const ACTIONS = {
  // Product actions
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  
  // Order actions
  VIEW_ORDERS: 'view_orders',
  MANAGE_ORDERS: 'manage_orders',
  
  // User actions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // Category actions
  MANAGE_CATEGORIES: 'manage_categories',
};

// Define role-based permissions
export const ROLE_PERMISSIONS = {
  admin: Object.values(ACTIONS),
  seller: [
    ACTIONS.VIEW_PRODUCTS,
    ACTIONS.CREATE_PRODUCT,
    ACTIONS.EDIT_PRODUCT,
    ACTIONS.VIEW_ORDERS,
    ACTIONS.MANAGE_ORDERS
  ],
  user: [
    ACTIONS.VIEW_PRODUCTS
  ]
};

// Helper function to convert array to string
export function permissionsToString(permissions) {
  return permissions.join(',');
}

// Helper function to convert string to array
export function stringToPermissions(permissionsString) {
  return permissionsString ? permissionsString.split(',') : [];
}

// Helper function to check if user has permission
export function hasPermission(user, action) {
  if (!user || !user.permissions) return false;
  const userPermissions = typeof user.permissions === 'string' 
    ? stringToPermissions(user.permissions) 
    : user.permissions;
  return userPermissions.includes(action);
}

// Helper function to get role permissions
export function getRolePermissions(role) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissionsToString(permissions);
}

export const PERMISSIONS = {
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  VIEW_ORDERS: 'view_orders',
  MANAGE_USERS: 'manage_users',
  // Add more permissions as needed
};


export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.permissions) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

export const hasAllPermissions = (user, permissions) => {
  if (!user || !user.permissions) return false;
  return permissions.every(permission => user.permissions.includes(permission));
}; 