import express from "express";
import dotenv from "dotenv";
import { runApp } from "./db/db.js";
import authRouter from "./routes/auth.js";
import productRouter from "./routes/products.js";
import orderRouter from "./routes/orders.js";

dotenv.config({ path: ".env" });
const port = 4001;
const app = express();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);

runApp(() => {
  app.listen(port, async () => {
    console.log(`Server is running at port : ${port}`);
  });
});
