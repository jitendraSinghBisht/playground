import { WebSocketServer } from 'ws';
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import wsRoute from './routes/ws.routes.js';

dotenv.config();

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
      console.log("Server running at port: ", process.env.PORT);
    });

    server.on("upgrade", wsRoute)
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
  });