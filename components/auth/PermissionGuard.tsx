"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
// Fallback to string since PermissionCode is not explicitly exported from lib/permissions
interface PermissionGuardProps {
    permission: string | string[];
    children: ReactNode;
    fallback?: ReactNode;
    requireAll?: boolean;
    userPermissions?: string[]; // Optional: Pass directly to avoid hook if available
}

export function PermissionGuard({
    permission,
    children,
    fallback = null,
    requireAll = false,
    userPermissions
}: PermissionGuardProps) {
    const { data: session } = useSession();

    // Use passed permissions or fall back to session
    // Note: If using server component passed props, userPermissions is preferred to avoid loading state flicker
    const currentPermissions = userPermissions || session?.user?.permissions || [];

    if (!currentPermissions) return <>{fallback}</>;

    // Super Admin Bypass
    if (currentPermissions.includes('*') || currentPermissions.includes('all')) {
        return <>{children}</>;
    }

    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

    const hasPermission = requireAll
        ? permissionsToCheck.every(p => currentPermissions.includes(p))
        : permissionsToCheck.some(p => currentPermissions.includes(p));

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
