/**
 * Migration script: Copies all data from local MongoDB to MongoDB Atlas
 * Run with: node scripts/migrate-to-atlas.js
 */
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const LOCAL_URI = 'mongodb://127.0.0.1:27017/planrite';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI || ATLAS_URI.includes('<db_password>')) {
    console.error('ERROR: MONGODB_URI not set or still has placeholder password in .env.local');
    process.exit(1);
}

// Collections to skip (don't migrate these to cloud)
const SKIP_COLLECTIONS = ['system.views', 'system.users'];

async function migrate() {
    let localClient, atlasClient;

    try {
        console.log('Connecting to local MongoDB (localhost:27017/planrite)...');
        localClient = new MongoClient(LOCAL_URI);
        await localClient.connect();
        console.log('✅ Connected to local DB');

        console.log('Connecting to MongoDB Atlas...');
        atlasClient = new MongoClient(ATLAS_URI);
        await atlasClient.connect();
        console.log('✅ Connected to Atlas');

        const localDb = localClient.db('planrite');
        const atlasDb = atlasClient.db(); // uses DB name from connection string

        // Get all collections from local DB
        const collections = await localDb.listCollections().toArray();
        console.log(`\nFound ${collections.length} collections to migrate:`);
        collections.forEach(c => console.log(`  - ${c.name}`));
        console.log('');

        let totalMigrated = 0;

        for (const collInfo of collections) {
            const collName = collInfo.name;
            if (SKIP_COLLECTIONS.includes(collName)) {
                console.log(`Skipping ${collName}`);
                continue;
            }

            const localColl = localDb.collection(collName);
            const atlasColl = atlasDb.collection(collName);

            // Count documents
            const count = await localColl.countDocuments();
            if (count === 0) {
                console.log(`⏩ ${collName}: empty, skipping`);
                continue;
            }

            console.log(`📦 Migrating ${collName} (${count} documents)...`);

            // Read all docs from local
            const docs = await localColl.find({}).toArray();

            // Clear existing Atlas collection first to avoid duplicate key conflicts,
            // then bulk-insert all local documents fresh
            await atlasColl.deleteMany({});
            if (docs.length > 0) { // Only insert if there are documents to insert
                await atlasColl.insertMany(docs, { ordered: false });
            }
            const upserted = docs.length;

            totalMigrated += upserted;
            console.log(`  ✅ ${collName}: ${upserted}/${count} documents migrated`);
        }

        console.log(`\n🎉 Migration complete! Total documents migrated: ${totalMigrated}`);

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.error('💡 Make sure your local MongoDB server is running!');
        }
    } finally {
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
    }
}

migrate();
