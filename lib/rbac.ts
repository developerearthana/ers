import { IUser } from '@/models/User';
import { IRole } from '@/models/Role';
import { IPermission } from '@/models/Permission';

/**
 * Checks if a user has a specific permission.
 * NOTE: This requires the user object to have 'customRole' populated with 'permissions'.
 * @param user The user object (populated)
 * @param permissionCode The permission code to check (e.g., 'user.create')
 * @returns boolean
 */
/**
 * Checks if the current context (time, IP) allows access based on role rules.
 */
function checkContextualRules(role: any): boolean {
    if (!role.contextualRules) return true;

    // Time Restriction Check
    if (role.contextualRules.timeRestricted && role.contextualRules.allowedHours) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [startStr, endStr] = role.contextualRules.allowedHours.split('-');
        if (startStr && endStr) {
            const [sH, sM] = startStr.split(':').map(Number);
            const [eH, eM] = endStr.split(':').map(Number);
            const startTime = sH * 60 + sM;
            const endTime = eH * 60 + eM;

            if (currentTime < startTime || currentTime > endTime) return false;
        }
    }
    return true;
}

export function hasPermission(user: any, permissionCode: string): boolean {
    if (!user || !user.customRole) {
        if (user?.role === 'admin') return true;
        return false;
    }

    const role = user.customRole as any;

    // 1. Hierarchy Bypass (Super Admins)
    if (role.level >= 100 || role.hierarchyLevel >= 100) return true;

    // 2. Contextual Restrictions
    if (!checkContextualRules(role)) return false;

    if (!role.permissions || !Array.isArray(role.permissions)) return false;

    // 3. Permission Check
    // Handle both populated objects and simple strings
    const permissions = role.permissions;
    return permissions.some((p: any) => {
        if (typeof p === 'string') return p === permissionCode || p === '*';
        return p.code === permissionCode;
    });
}

/**
 * Checks if a user has a specific role or higher level.
 * @param user 
 * @param roleName 
 * @returns 
 */
export function hasRole(user: any, roleName: string): boolean {
    if (!user?.customRole) return user?.role === 'admin' && roleName === 'Admin';
    const role = user.customRole as any;
    return role.name === roleName;
}

/**
 * Check if user access level is sufficient
 * @param user 
 * @param minLevel 
 * @returns 
 */
export function hasAccessLevel(user: any, minLevel: number): boolean {
    if (!user?.customRole) return user?.role === 'admin' && minLevel <= 100;
    const role = user.customRole as any;
    return role.level >= minLevel;
}
