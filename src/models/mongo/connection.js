const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

async function connectMongo() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message);
    throw error;
  }
}

module.exports = { connectMongo, mongoose };

