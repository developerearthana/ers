const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://developer_db_user:earthana@cluster0.glcvqb6.mongodb.net/?appName=Cluster0";

async function cloneDatabase() {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected successfully!");

        const sourceDb = client.db("test"); // Mongoose default when no name provided
        const targetDb = client.db("earthana_dev");

        // Get all collections from source
        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections in production.`);

        for (let col of collections) {
            const colName = col.name;
            console.log(`Copying collection: ${colName}...`);
            
            // Drop target collection if exists to avoid duplicates
            try {
                await targetDb.collection(colName).drop();
            } catch (e) {
                // Ignore drop errors if it doesn't exist
            }

            const docs = await sourceDb.collection(colName).find({}).toArray();
            if (docs.length > 0) {
                await targetDb.collection(colName).insertMany(docs);
                console.log(` -> Copied ${docs.length} documents.`);
            } else {
                console.log(` -> Empty collection, skipped.`);
            }
        }

        console.log("Database cloning completed! You now have a fresh copy of your production data in your local environment.");
    } catch (err) {
        console.error("Error cloning database:", err);
    } finally {
        await client.close();
    }
}

cloneDatabase();
