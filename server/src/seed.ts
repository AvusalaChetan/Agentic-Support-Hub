import mongoose from "mongoose";
import dotenv from "dotenv";
import {Order} from "./models/Order";
import {User} from "./models/User";
import { orderSampleData, userSampleData  } from "./utils/sampleData";

dotenv.config();

const seedData = async () => {
  // Clear existing data with error handling
  try {
    const orderDeleteResult = await Order.deleteMany({});
    const userDeleteResult = await User.deleteMany({});
  } catch (deleteErr) {
    console.error("Error deleting documents:", deleteErr);
    throw deleteErr;
  }

  // Create demo user
  try {
    await User.create(userSampleData);
    console.log("Demo user inserted.");
  } catch (userErr) {
    console.error("Error inserting demo user:", userErr);
    throw userErr;
  }

  // Create demo orders with varied timestamps for testing the 45-min rule
  try {
    await Order.insertMany(orderSampleData);
    console.log("Demo orders inserted.");
  } catch (orderErr) {
    console.error("Error inserting demo orders:", orderErr);
    throw orderErr;
  }
};

// If run directly, connect/disconnect
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }
  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("Connected to MongoDB");
      await seedData();
      await mongoose.disconnect();
      console.log("✅ Done!");
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export {seedData};
