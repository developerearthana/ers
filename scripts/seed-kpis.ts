import path from 'path';
import dotenv from 'dotenv';

console.log("Starting seed script...");

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import KPITemplate from '../models/KPITemplate';
import { KPI_LIBRARY } from '../lib/kpi-data';

const MONGODB_URI = process.env.MONGODB_URI;

const seedKPIs = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("Error: MONGODB_URI is undefined.");
            process.exit(1);
        }

        console.log("Connecting to DB at", MONGODB_URI.substring(0, 20) + "...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB.");

        for (const kpi of KPI_LIBRARY) {
            const exists = await KPITemplate.findOne({ name: kpi.name, department: kpi.department });
            if (!exists) {
                await KPITemplate.create(kpi);
                console.log(`Created: ${kpi.name}`);
            } else {
                console.log(`Skipped (Exists): ${kpi.name}`);
            }
        }
        console.log("Seeding Complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding KPIs:", error);
        process.exit(1);
    }
};

seedKPIs();
