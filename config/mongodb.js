const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;

const connectToMongoDB = async () =>{
    try {
        if (!MONGODB_URL) {
            console.error('MONGODB_URL is not defined in environment variables');
            return;
        }
        
        mongoose.connect(`${MONGODB_URL}/e-commerce-db`, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if server selection fails
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        })
        .then(() => console.log('MongoDB Connected!'))
        .catch((error) => {
            console.error('MongoDB connection error:', error.message);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

module.exports = connectToMongoDB;
