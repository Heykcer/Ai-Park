const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

console.log('--- Database Connection Test ---');
console.log('URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@')); // Hide password

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connection successful!');

        // List collections to verify access
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.reason) {
            console.error('Reason:', JSON.stringify(error.reason, null, 2));
        }
        process.exit(1);
    }
}

testConnection();
