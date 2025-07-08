import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
      const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    // const connectionInstance = await mongoose.connect(
    //   `mongodb+srv://sana:sana123@cluster0.7n3xrry.mongodb.net/${DB_NAME}`
    // );
    console.log(
      `\n MongoDb conected !! DB HOST:${connectionInstance.connection.host}, PORT: ${connectionInstance.connection.port}`
    );
  } catch (error) {
    console.log("Mnogoose connection error", error);
    process.exit(1);
  }
};

export default connectDB;
