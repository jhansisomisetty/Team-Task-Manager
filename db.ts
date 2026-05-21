import mongoose from 'mongoose';

let isMongoConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠️ MONGO_URI is not defined. Falling back to high-fidelity Local JSON Database.");
    isMongoConnected = false;
    return false;
  }
  try {
    // Set connection timeout to 5 seconds so it doesn't hang forever
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected successfully.");
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.warn("⚠️ Falling back to high-fidelity Local JSON Database.");
    isMongoConnected = false;
    return false;
  }
}

export function getIsMongoConnected() {
  return isMongoConnected;
}
