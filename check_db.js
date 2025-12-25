import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from './src/models/Admin.js';

async function check() {
    try {
        const uri = process.env.MONGO_URL;
        if (!uri) {
            console.error('MONGO_URL not found in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log(`Connected to database: ${mongoose.connection.name}`);

        const admins = await Admin.find({});
        console.log('--- ADMIN ACCOUNTS ---');
        if (admins.length === 0) {
            console.log('No admin accounts found.');
        } else {
            admins.forEach(a => {
                console.log(`- Email: "${a.email}" | Name: "${a.name}"`);
            });
        }
        console.log('----------------------');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

check();
