const mongoose = require('mongoose');
const { logInfo, logError } = require('../utils/logger');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    logInfo('MongoDB connected');
  } catch (error) {
    logError('MongoDB connection failed', error);
    throw error;
  }
};

module.exports = connectDB;