export interface ModuleDef {
    code: string;
    label: string;
    subModules?: { code: string; label: string }[];
}

export const MODULE_GROUPS: { category: string; modules: ModuleDef[] }[] = [
    {
        category: "Core Modules",
        modules: [
            { code: 'dashboard', label: 'Dashboard' },
            {
                code: 'activity',
                label: 'Activity',
                subModules: [
                    { code: 'calendar', label: 'Calendar' },
                    { code: 'chat', label: 'Chat' },
                    { code: 'documents', label: 'Documents' },
                    { code: 'todo', label: 'Todo List' }
                ]
            },
            { code: 'projects', label: 'Projects' },
            { code: 'goals', label: 'Goals' },
        ]
    },
    {
        category: "Business Operations",
        modules: [
            {
                code: 'sales',
                label: 'Sales',
                subModules: [
                    { code: 'pipeline', label: 'Pipeline' },
                    { code: 'orders', label: 'Orders' },
                    { code: 'invoices', label: 'Invoices' },
                    { code: 'reports', label: 'Reports' }
                ]
            },
            {
                code: 'purchase',
                label: 'Purchase',
                subModules: [
                    { code: 'vendors', label: 'Vendors' },
                    { code: 'orders', label: 'Purchase Orders' },
                    { code: 'inventory', label: 'Stock' }
                ]
            },
            { code: 'work-orders', label: 'Work Orders' },
        ]
    },
    {
        category: "Management & Admin",
        modules: [
            { code: 'accounting', label: 'Accounting' },
            { code: 'hrm', label: 'HRM' },
            { code: 'assets', label: 'Assets' },
            {
                code: 'marketing',
                label: 'Marketing',
                subModules: [
                    { code: 'campaigns', label: 'Campaigns' },
                    { code: 'social', label: 'Social Media' }
                ]
            },
            { code: 'contacts', label: 'Contacts' },
            { code: 'masters', label: 'Masters' },
            { code: 'admin', label: 'Admin Functions' },
        ]
    },
    {
        category: "Portals",
        modules: [
            { code: 'vendor-dash', label: 'Vendor Portal' },
            { code: 'customer-dash', label: 'Customer Portal' },
        ]
    }
];

export const ACTIONS = [
    { code: 'view', label: 'View / Access', description: 'Page level access' },
    { code: 'create', label: 'Create', description: 'Button level: Add New' },
    { code: 'edit', label: 'Edit', description: 'Button level: Modify' },
    { code: 'delete', label: 'Delete', description: 'Button level: Remove' },
    { code: 'approve', label: 'Approve', description: 'Button level: Authorize' },
] as const;

// Helper to check permission: "sales.create"
export const PERMISSIONS = MODULE_GROUPS.flatMap(g => g.modules.map(m => ({ code: m.code, label: m.label })));


// Helper to get all permissions for a module
const getModulePermissions = (moduleCode: string, actions: string[] = ['view', 'create', 'edit', 'delete', 'approve']) => {
    return actions.map(action => action === 'view' ? moduleCode : `${moduleCode}.${action}`);
};

// Helper to generate all permissions for Super Admin
const ALL_MODULE_CODES = MODULE_GROUPS.flatMap(g => g.modules.map(m => m.code));
const generateAllPermissions = () => {
    return ALL_MODULE_CODES.flatMap(code => getModulePermissions(code, ['view', 'create', 'edit', 'delete', 'approve']));
};

export const ROLE_TEMPLATES: Record<string, { label: string; description: string; permissions: string[] }> = {
    'super_admin': {
        label: 'Super Administrator',
        description: 'Complete system access with all privileges.',
        permissions: generateAllPermissions()
    },
    'admin': {
        label: 'System Administrator',
        description: 'Manage users, settings, and organization structure.',
        permissions: [
            ...getModulePermissions('admin'),
            ...getModulePermissions('masters'),
            ...getModulePermissions('dashboard'),
            ...getModulePermissions('hrm'),
            ...getModulePermissions('accounting'),
            ...getModulePermissions('projects', ['view', 'delete']),
        ]
    },
    'manager': {
        label: 'General Manager',
        description: 'Operational oversight and approval authority.',
        permissions: [
            'dashboard', 'dashboard.executive',
            ...getModulePermissions('sales', ['view', 'approve']),
            ...getModulePermissions('purchase', ['view', 'approve']),
            ...getModulePermissions('projects', ['view', 'approve']),
            ...getModulePermissions('hrm', ['view', 'approve']),
        ]
    },
    'hr_manager': {
        label: 'HR Manager',
        description: 'Manage employees, payroll, and recruitment.',
        permissions: [
            'dashboard', 'dashboard.manager',
            ...getModulePermissions('hrm'),
            ...getModulePermissions('activity.documents'),
        ]
    },
    'accountant': {
        label: 'Accountant',
        description: 'Financial record keeping and invoicing.',
        permissions: [
            'dashboard',
            ...getModulePermissions('accounting'),
            ...getModulePermissions('sales.invoices'),
            ...getModulePermissions('purchase'),
        ]
    },
    'staff': {
        label: 'Standard Staff',
        description: 'Basic employee access (Tasks, Chat, Profile).',
        permissions: [
            'dashboard',
            ...getModulePermissions('activity.todo'),
            ...getModulePermissions('activity.calendar'),
            ...getModulePermissions('hrm', ['view']), // Self view
        ]
    }
};
