import { WebSocketServer } from 'ws';
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log("Server running at port: ", process.env.PORT);
  });
})
.catch((err) => {
  console.log("MongoDB connection error: ", err);
});