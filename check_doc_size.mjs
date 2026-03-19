import mongoose from 'mongoose';async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Use raw collection to avoid Mongoose proxy overhead
    const collection = mongoose.connection.db.collection('users');
    
    const superadmin = await collection.findOne({ email: 'superadmin@planrite.com' });
    const manager = await collection.findOne({ email: 'manager@planrite.com' });
    
    console.log('Superadmin document stringified length (bytes):', Buffer.byteLength(JSON.stringify(superadmin)));
    console.log('Manager document stringified length (bytes):', Buffer.byteLength(JSON.stringify(manager)));
    
    if (superadmin) {
        // print keys and sizes
        for (const [key, value] of Object.entries(superadmin)) {
            const size = Buffer.byteLength(JSON.stringify(value));
            if (size > 1000) {
                 console.log(`MASSIVE KEY DETECTED in superadmin: ${key} -> ${size} bytes`);
            }
        }
    }
    
    await mongoose.disconnect();
}
test();
