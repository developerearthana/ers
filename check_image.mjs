import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

await mongoose.connect(MONGODB_URI);

const UserSchema = new mongoose.Schema({ email: String, image: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const superadmin = await User.findOne({ email: 'superadmin@planrite.com' }).lean();

if (superadmin) {
    const imageSize = superadmin.image ? superadmin.image.length : 0;
    console.log(`Image length: ${imageSize} characters`);
    if (imageSize > 100) {
        console.log(`Starts with: ${superadmin.image.substring(0, 100)}...`);
    } else {
        console.log(`Image: ${superadmin.image}`);
    }
} else {
    console.log('Superadmin not found.');
}

await mongoose.disconnect();
