import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

import session from "express-session";
app.set("trust proxy", true);
app.use(session({
  secret: 'Anything secret',
  proxy: true,
  cookie: { secure: true, sameSite: "none", httpOnly: true }
}));

app.use(cors({credentials: true, origin: `${process.env.CORS_ORIGIN || "http://localhost:5173"}`}));
app.use(express.json());
app.use(cookieParser());

//routes import
import healthRoute from "./routes/healthcheck.routes.js";
import userRoute from "./routes/user.routes.js";
import volumeRoute from "./routes/volume.routes.js";
import containerRoute from "./routes/container.routes.js";

//routes
app.use("/api",healthRoute);
app.use("/api/user", userRoute);
app.use("/api/volume", volumeRoute);
app.use("/api/container", containerRoute);

//webSocket
const wssT = new WebSocketServer({noServer: true})
const wssF = new WebSocketServer({noServer: true})

export { app, wssF, wssT };