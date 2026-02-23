// KPI Entry Modal Types
export interface KPIEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (entry: KPIEntry) => void;
    subsidiaries: string[];
    metrics: string[];
    users: User[];
    targets: KPITarget[];
}

export interface KPIEntry {
    week: string;
    subsidiary: string;
    metric: string;
    assignee: string;
    team: string;
    target: string;
    actual: string;
    comment: string;
    date: string;
    goalId?: string;
}

export interface User {
    id: string;
    name: string;
    dept: string;
}

export interface KPITarget {
    user: string;
    metric: string;
    target: string;
}

// Transaction Form Types
export interface TransactionFormProps {
    mode?: string;
}

// Audit Log Types
export interface AuditLogEntry {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    status: 'success' | 'failure' | 'warning';
    details?: Record<string, unknown>;
}

// Safe Action Types
export interface ActionState<T> {
    success?: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
    timestamp?: number;
}
