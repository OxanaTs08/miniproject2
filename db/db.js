import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const uri = process.env.MONGO_URI;

export const runApp = async (callback) => {
  mongoose
    .connect(uri, {})
    .then(() => {
      console.log("Mongoos Database connected successfully");
      callback();
    })
    .catch((error) => {
      console.log("Mongoose connection failed:", error);
    });
};
