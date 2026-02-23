export const KPI_LIBRARY = [
    // SALES
    { name: "Monthly Recurring Revenue (MRR)", industry: "SaaS", department: "Sales", unit: "Currency", calcMethod: "Sum", frequency: "Monthly", description: "Total predictable revenue generated from subscriptions." },
    { name: "Customer Acquisition Cost (CAC)", industry: "All", department: "Sales", unit: "Currency", calcMethod: "Average", frequency: "Quarterly", description: "Cost to acquire a new customer." },
    { name: "Sales Pipeline Value", industry: "All", department: "Sales", unit: "Currency", calcMethod: "Latest", frequency: "Weekly", description: "Total value of open opportunities." },
    { name: "Lead Conversion Rate", industry: "All", department: "Sales", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of leads that convert to deals." },
    { name: "Average Deal Size", industry: "All", department: "Sales", unit: "Currency", calcMethod: "Average", frequency: "Quarterly", description: "Average value of closed-won deals." },

    // MARKETING
    { name: "Website Traffic", industry: "All", department: "Marketing", unit: "Count", calcMethod: "Sum", frequency: "Monthly", description: "Number of unique visitors." },
    { name: "Cost Per Lead (CPL)", industry: "All", department: "Marketing", unit: "Currency", calcMethod: "Average", frequency: "Monthly", description: "Marketing spend divided by leads generated." },
    { name: "Click-Through Rate (CTR)", industry: "Digital", department: "Marketing", unit: "%", calcMethod: "Average", frequency: "Weekly", description: "Ratio of users who click on a link." },
    { name: "Social Media Engagement", industry: "All", department: "Marketing", unit: "Count", calcMethod: "Sum", frequency: "Monthly", description: "Total likes, shares, and comments." },

    // HUMAN RESOURCES
    { name: "Employee Turnover Rate", industry: "All", department: "HR", unit: "%", calcMethod: "Average", frequency: "Quarterly", description: "Rate at which employees leave the company." },
    { name: "Time to Hire", industry: "All", department: "HR", unit: "Days", calcMethod: "Average", frequency: "Monthly", description: "Average days to fill a vacant position." },
    { name: "Employee Satisfaction Score", industry: "All", department: "HR", unit: "Score", calcMethod: "Average", frequency: "Quarterly", description: "NPS score from internal surveys." },
    { name: "Absenteeism Rate", industry: "All", department: "HR", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of unscheduled absences." },

    // ENGINEERING / PRODUCT
    { name: "Sprint Velocity", industry: "Tech", department: "Engineering", unit: "Points", calcMethod: "Sum", frequency: "Weekly", description: "Story points completed per sprint." },
    { name: "Bug Defect Density", industry: "Tech", department: "Engineering", unit: "Count", calcMethod: "Average", frequency: "Monthly", description: "Bugs found per 1000 lines of code." },
    { name: "Uptime / Availability", industry: "Tech", department: "Engineering", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "System availability percentage." },
    { name: "Mean Time to Recovery (MTTR)", industry: "Tech", department: "Engineering", unit: "Hours", calcMethod: "Average", frequency: "Monthly", description: "Average time to restore service." },

    // FINANCE
    { name: "Gross Profit Margin", industry: "All", department: "Finance", unit: "%", calcMethod: "Average", frequency: "Quarterly", description: "Revenue minus COGS." },
    { name: "Operating Cash Flow", industry: "All", department: "Finance", unit: "Currency", calcMethod: "Sum", frequency: "Monthly", description: "Cash generated from operations." },
    { name: "Burn Rate", industry: "Startup", department: "Finance", unit: "Currency", calcMethod: "Average", frequency: "Monthly", description: "Rate at which cash is spent." },
    { name: "Current Ratio", industry: "All", department: "Finance", unit: "Ratio", calcMethod: "Latest", frequency: "Quarterly", description: "Current assets divided by liabilities." },

    // MANUFACTURING / OPERATIONS
    { name: "Overall Equipment Effectiveness (OEE)", industry: "Manufacturing", department: "Operations", unit: "%", calcMethod: "Average", frequency: "Daily", description: "Productivity of manufacturing equipment." },
    { name: "Defect Rate", industry: "Manufacturing", department: "Quality", unit: "%", calcMethod: "Average", frequency: "Weekly", description: "Percentage of defective products." },
    { name: "Inventory Turnover", industry: "Retail/Mfg", department: "Operations", unit: "Ratio", calcMethod: "Average", frequency: "Quarterly", description: "COGS divided by average inventory." },
    { name: "On-Time Delivery Rate", industry: "Logistics", department: "Operations", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of orders delivered on time." },

    // CUSTOMER SUCCESS
    { name: "Net Promoter Score (NPS)", industry: "All", department: "Support", unit: "Score", calcMethod: "Average", frequency: "Quarterly", description: "Customer loyalty metric." },
    { name: "Churn Rate", industry: "SaaS", department: "Support", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of customers cancelling." },
    { name: "First Response Time", industry: "All", department: "Support", unit: "Minutes", calcMethod: "Average", frequency: "Weekly", description: "Time to first reply to tickets." },
    { name: "Customer Lifetime Value (CLV)", industry: "All", department: "Sales/Support", unit: "Currency", calcMethod: "Average", frequency: "Yearly", description: "Total revenue expected from a customer." },
    // SALES TEAM PERFORMANCE
    { name: "Sales Calls Generated", industry: "All", department: "Sales", unit: "Count", calcMethod: "Sum", frequency: "Daily", description: "Number of outbound sales calls made." },
    { name: "Sales Calls Closed", industry: "All", department: "Sales", unit: "Count", calcMethod: "Sum", frequency: "Daily", description: "Number of sales calls resulting in a closed deal." },

    // PROJECT MANAGEMENT (Turnkey / Construction)
    { name: "Schedule Variance (SV)", industry: "Construction", department: "Projects", unit: "%", calcMethod: "Latest", frequency: "Weekly", description: "Difference between planned and actual progress." },
    { name: "Cost Variance (CV)", industry: "Construction", department: "Projects", unit: "%", calcMethod: "Latest", frequency: "Weekly", description: "Difference between earned value and actual cost." },
    { name: "Milestone Hit Rate", industry: "Construction", department: "Projects", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of milestones completed on time." },
    { name: "Safety Incident Rate", industry: "Construction", department: "Safety", unit: "Count", calcMethod: "Sum", frequency: "Monthly", description: "Number of reported safety incidents." },
    { name: "Material Wastage Rate", industry: "Construction", department: "Operations", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of materials wasted vs used." },

    // ARCHITECTURE & DESIGN
    { name: "Design Rework Rate", industry: "Architecture", department: "Design", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Percentage of designs requiring rework." },
    { name: "Blueprint Approval Time", industry: "Architecture", department: "Design", unit: "Days", calcMethod: "Average", frequency: "Project", description: "Average time to get client/regulatory approval." },

    // MANUFACTURING & RE-ENGINEERING
    { name: "Cycle Time", industry: "Manufacturing", department: "Production", unit: "Minutes", calcMethod: "Average", frequency: "Daily", description: "Time to complete one cycle of an operation." },
    { name: "First Pass Yield (FPY)", industry: "Manufacturing", department: "Quality", unit: "%", calcMethod: "Average", frequency: "Daily", description: "Percentage of products passing quality check primarily." },
    { name: "Process Efficiency Gain", industry: "Re-Engineering", department: "R&D", unit: "%", calcMethod: "Latest", frequency: "Project", description: "Improvement in process speed/cost after re-engineering." },
    { name: "Capacity Utilization", industry: "Manufacturing", department: "Production", unit: "%", calcMethod: "Average", frequency: "Monthly", description: "Extent to which productive capacity is used." },

    // TURNKEY & CLIENT SUCCESS
    { name: "Handover Timeliness", industry: "Turnkey", department: "Projects", unit: "Days", calcMethod: "Average", frequency: "Project", description: "Deviation from agreed handover date." },
    { name: "Client Sign-off Velocity", industry: "Turnkey", department: "Projects", unit: "Days", calcMethod: "Average", frequency: "Project", description: "Time taken to get final sign-off after completion." }
];
