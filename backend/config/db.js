const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (e) {
      console.log(`⚠️ Failed to connect to local MongoDB (${e.message}).`);
      console.log(`🔄 Spinning up temporary in-memory database...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
