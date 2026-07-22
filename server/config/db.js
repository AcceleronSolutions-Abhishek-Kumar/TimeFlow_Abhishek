import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/timeflow"
    )
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.log("ℹ️  Make sure MongoDB service is running or update MONGODB_URI in server/.env")
  }
}
