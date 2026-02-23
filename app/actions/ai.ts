"use server";

import { aiService } from '@/services/AIService';
import { auth } from '@/auth'; // Assuming auth is available

export const generateAIContent = async (type: 'Post' | 'Reply' | 'Email' | 'Strategy', data: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.email || 'guest'; // Fallback to guest if no auth

        const result = await aiService.generateContent(userId, type, data);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getAIHistory = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.email || 'guest';

        const history = await aiService.getHistory(userId);
        return { success: true, data: history };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
