import * as dotenv from 'dotenv'
import mongoose from "mongoose";
dotenv.config()

const url = process.env.MONGO_URL || "mongodb://0.0.0.0:27017"
if (!url) {
  throw Error('didn\'t find url')
}

export const runDb = async () => {
  try {
    await mongoose.connect(url, {dbName: process.env.DB_NAME})
  } catch (e) {
    console.log('database connection failure')
    await mongoose.disconnect()
  }
}
