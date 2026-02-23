"use server";

import { salesService } from "@/services/SalesService";

export const getSalesDashboardData = async () => {
    try {
        const data = await salesService.getDashboardStats();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getLeads = async () => {
    try {
        const data = await salesService.getLeads();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getDeals = async () => {
    try {
        const data = await salesService.getDeals();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getOrders = async () => {
    try {
        const data = await salesService.getOrders();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getInvoices = async () => {
    try {
        const data = await salesService.getInvoices();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createLead = async (data: any) => {
    try {
        const res = await salesService.createLead(data);
        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createOrder = async (data: any) => {
    try {
        const res = await salesService.createOrder(data);
        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const createInvoice = async (data: any) => {
    try {
        const res = await salesService.createInvoice(data);
        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const addFollowUp = async (leadId: string, status: string, remark: string) => {
    try {
        const res = await salesService.addFollowUp(leadId, status, remark);
        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// ============= AI-POWERED ACTIONS =============

import { aiService } from "@/services/AIService";

/**
 * Get leads enriched with AI scores
 */
export const getLeadsWithAI = async () => {
    try {
        const data = await aiService.getLeadsWithScores();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Get at-risk deals for dashboard
 */
export const getAtRiskDeals = async () => {
    try {
        const data = await aiService.getAtRiskDeals();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Get revenue forecast
 */
export const getRevenueForecast = async () => {
    try {
        const data = await aiService.generateForecast();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
