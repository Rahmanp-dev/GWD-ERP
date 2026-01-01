/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines permissions for each role and provides utilities for access checking.
 */

// Permission types
export type Permission =
    // CRM
    | 'crm:read' | 'crm:create' | 'crm:update' | 'crm:delete' | 'crm:assign' | 'crm:convert'
    // Projects
    | 'projects:read' | 'projects:create' | 'projects:update' | 'projects:delete' | 'projects:manage'
    // Tasks
    | 'tasks:read' | 'tasks:create' | 'tasks:update' | 'tasks:delete' | 'tasks:assign'
    // Finance
    | 'finance:read' | 'finance:create' | 'finance:approve' | 'finance:export'
    // Commissions
    | 'commissions:read' | 'commissions:create' | 'commissions:approve' | 'commissions:pay'
    // HR
    | 'hr:read' | 'hr:create' | 'hr:update' | 'hr:delete'
    // Admin
    | 'admin:users' | 'admin:roles' | 'admin:audit' | 'admin:settings' | 'admin:automations'
    // Reports
    | 'reports:read' | 'reports:create' | 'reports:export';

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    'CEO': [
        // Full access to everything
        'crm:read', 'crm:create', 'crm:update', 'crm:delete', 'crm:assign', 'crm:convert',
        'projects:read', 'projects:create', 'projects:update', 'projects:delete', 'projects:manage',
        'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:assign',
        'finance:read', 'finance:create', 'finance:approve', 'finance:export',
        'commissions:read', 'commissions:create', 'commissions:approve', 'commissions:pay',
        'hr:read', 'hr:create', 'hr:update', 'hr:delete',
        'admin:users', 'admin:roles', 'admin:audit', 'admin:settings', 'admin:automations',
        'reports:read', 'reports:create', 'reports:export'
    ],

    'Admin': [
        'crm:read', 'crm:create', 'crm:update', 'crm:delete', 'crm:assign', 'crm:convert',
        'projects:read', 'projects:create', 'projects:update', 'projects:delete', 'projects:manage',
        'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:assign',
        'finance:read', 'finance:create', 'finance:approve', 'finance:export',
        'commissions:read', 'commissions:create', 'commissions:approve', 'commissions:pay',
        'hr:read', 'hr:create', 'hr:update', 'hr:delete',
        'admin:users', 'admin:roles', 'admin:audit', 'admin:settings', 'admin:automations',
        'reports:read', 'reports:create', 'reports:export'
    ],

    'Sales Manager': [
        'crm:read', 'crm:create', 'crm:update', 'crm:assign', 'crm:convert',
        'projects:read',
        'tasks:read', 'tasks:create', 'tasks:update',
        'commissions:read', 'commissions:approve',
        'reports:read', 'reports:export',
        'admin:automations'
    ],

    'Salesperson': [
        'crm:read', 'crm:create', 'crm:update', // Own deals only
        'tasks:read', 'tasks:create', 'tasks:update',
        'commissions:read', // Own only
        'reports:read'
    ],

    'CFO': [
        'crm:read',
        'projects:read',
        'finance:read', 'finance:create', 'finance:approve', 'finance:export',
        'commissions:read', 'commissions:approve', 'commissions:pay',
        'hr:read',
        'reports:read', 'reports:create', 'reports:export',
        'admin:audit'
    ],

    'Project Manager': [
        'crm:read',
        'projects:read', 'projects:create', 'projects:update', 'projects:manage',
        'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:assign',
        'reports:read', 'reports:export'
    ],

    'HR Manager': [
        'hr:read', 'hr:create', 'hr:update', 'hr:delete',
        'reports:read', 'reports:export',
        'admin:users'
    ],

    'Ops': [
        'projects:read', 'projects:update',
        'tasks:read', 'tasks:create', 'tasks:update',
        'reports:read'
    ],

    'Employee': [
        'tasks:read', 'tasks:update', // Own tasks only
        'hr:read' // Own profile only
    ]
};

// Alias for admin
ROLE_PERMISSIONS['admin'] = ROLE_PERMISSIONS['Admin'];

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
    return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
    return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: string | undefined): Permission[] {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Middleware helper for API routes
 */
export function requirePermission(role: string | undefined, permission: Permission): { allowed: true } | { allowed: false; error: string } {
    if (!hasPermission(role, permission)) {
        return {
            allowed: false,
            error: `Permission denied: ${permission}`
        };
    }
    return { allowed: true };
}
