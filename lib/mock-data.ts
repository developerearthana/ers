export const MOCK_USERS = [
    { id: "USR-001", name: "Rajesh Kumar", email: "rajesh.k@earthana.com", role: "Admin", status: "Active", dept: "IT" },
    { id: "USR-002", name: "Sarah Williams", email: "sarah.w@earthana.com", role: "Manager", status: "Active", dept: "HR" },
    { id: "USR-003", name: "Amit Patel", email: "amit.p@earthana.com", role: "User", status: "Active", dept: "Sales" },
    { id: "USR-004", name: "Priya Sharma", email: "priya.s@earthana.com", role: "User", status: "Inactive", dept: "Marketing" },
    { id: "USR-005", name: "John Doe", email: "john.d@earthana.com", role: "Manager", status: "Active", dept: "Operations" },
];

export const DEPARTMENTS = ["IT", "HR", "Sales", "Marketing", "Operations", "Finance"];

export const MOCK_KPI_TARGETS = [
    { id: 1, user: "Amit Patel", metric: "Sales Revenue", target: "50L", period: "Monthly" },
    { id: 2, user: "Sarah Williams", metric: "Lead Response Time", target: "< 1h", period: "Daily" },
    { id: 3, user: "John Doe", metric: "Production Output", target: "1000", period: "Weekly" },
];

export const MOCK_PROJECT_TEMPLATES = [
    {
        id: 1,
        name: "Architectural Design Flow",
        description: "Standard flow for architectural projects from lead to handover.",
        stages: [
            { id: "s1", name: "Lead & Followup", modules: ["CRM", "Communication"] },
            { id: "s2", name: "Site Inspection & Meetings", modules: ["Schedule", "Maps"] },
            { id: "s3", name: "Documentations & Agreements", modules: ["Docs", "Signatures"] },
            { id: "s4", name: "Architectural Planning", modules: ["Blueprints", "CAD"] },
            { id: "s5", name: "Construction Management", modules: ["Civil Work", "Electrical Work", "Plumbing Work"] },
            { id: "s6", name: "Interior Designing", modules: ["MoodBoards", "Procurement"] },
            { id: "s7", name: "Client Communication", modules: ["Chat", "Updates"] },
            { id: "s8", name: "Handover & Feedback", modules: ["Signoff", "Surveys"] },
        ]
    },
    {
        id: 2,
        name: "Construction Execution Flow",
        description: "Detailed construction execution workflow.",
        stages: [
            { id: "ce1", name: "Project Approval & Work Order", modules: ["Approvals", "Docs"] },
            { id: "ce2", name: "Working Drawings", modules: ["Blueprints", "CAD"] },
            { id: "ce3", name: "Civil Works Exec", modules: ["Civil Work"] }, // Special module with sub-items
            { id: "ce4", name: "Structure & Roofing", modules: ["Structure", "Roofing"] },
            { id: "ce5", name: "MEP Works (Mech, Elec, Plumbing)", modules: ["Electrical Work", "Plumbing Work"] },
            { id: "ce6", name: "Finishing & Plastering", modules: ["Plastering", "Flooring", "Painting"] },
            { id: "ce7", name: "Final Handover", modules: ["Signoff"] },
        ]
    },
    {
        id: 3,
        name: "Interior Design Flow",
        description: "Focused interior design and fit-out workflow.",
        stages: [
            { id: "id1", name: "Concept & Mood Board", modules: ["MoodBoards"] },
            { id: "id2", name: "3D Visuals & Approval", modules: ["3D Models", "Approvals"] },
            { id: "id3", name: "Material Selection", modules: ["Material Board", "Inventory"] },
            { id: "id4", name: "Fit-out Execution", modules: ["Carpentry", "Civil Work"] },
            { id: "id5", name: "Lighting & Decor", modules: ["Electrical Work", "Decor"] },
            { id: "id6", name: "Handover", modules: ["Signoff"] },
        ]
    },
    {
        id: 4,
        name: "Re-Engineering / Renovation",
        description: "For renovation and restructuring projects.",
        stages: [
            { id: "re1", name: "Site Survey & Analysis", modules: ["Survey", "Docs"] },
            { id: "re2", name: "Demolition Planning", modules: ["Demolition", "Safety"] },
            { id: "re3", name: "Structural Reinforcement", modules: ["Structure", "Civil Work"] },
            { id: "re4", name: "Re-construction", modules: ["Construction", "MEP"] },
            { id: "re5", name: "Finishing", modules: ["Finishing"] },
        ]
    }
];

// Consolidated Project List (to link Work Orders)
export const MOCK_PROJECT_LIST = [
    { id: 1, name: "Eco-Villa Design", subsidiary: "Rudra Architectural Studio (RAS)" },
    { id: 2, name: "Factory Layout Optimization", subsidiary: "Gridwise" },
    { id: 3, name: "Corporate Office Furniture", subsidiary: "Metrum Works" },
    { id: 4, name: "Annual Maintenance Contract", subsidiary: "Rite Hands" },
];

export const MOCK_SUBSIDIARIES = ["Rudra Architectural Studio (RAS)", "Gridwise", "Metrum Works", "Rite Hands"];

export const MOCK_VENDORS = [
    { id: "V001", name: "BuildFast Const. Co" },
    { id: "V002", name: "SafeSecure Systems" },
    { id: "V003", name: "GreenGardens Landscaping" },
    { id: "V004", name: "CoolAir HVAC Solutions" },
];

export const MOCK_WORK_ORDERS = [
    { id: "WO-2026-001", title: "HVAC Maintenance - Block B", type: "Internal", priority: "High", status: "In Progress", assignee: "Ramesh Tech", date: "Today", location: "Block B, Floor 2", cost: 15000, project: "Eco-Villa Design" },
    { id: "WO-2026-002", title: "Replace Lobby Lights", type: "Vendor", priority: "Medium", status: "Open", assignee: "BuildFast Const. Co", date: "Yesterday", location: "Main Lobby", cost: 5000, project: "Corporate Office Furniture" },
    { id: "WO-2026-003", title: "Fire Alarm Testing", type: "Internal", priority: "Critical", status: "Open", assignee: "Safety Team", date: "2 days ago", location: "All Floors", cost: 0, project: "Factory Layout Optimization" },
];
