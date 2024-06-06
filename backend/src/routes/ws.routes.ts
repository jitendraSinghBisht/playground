import internal from "stream";
import { wssF, wssT } from "../app.js";
import { IncomingMessage } from "http";
import { terminalConnect } from "../controllers/terminal.controller.js";

function wsRoute(req: IncomingMessage, socket: internal.Duplex, head: Buffer) {
  if (!req.url) {
    socket.destroy();
    return;
  }
  const { pathname } = new URL(req.url, 'ws://localhost');

  if (pathname.startsWith('/terminal')) {
    // "/terminal/container/:id"
    wssT.handleUpgrade(req, socket, head, (ws) => {
      wssT.on('connection', () => {
        terminalConnect(ws, pathname.split("/").pop()!)
      });
      wssT.emit('connection');
    });
  } else if (pathname.startsWith('/folder')) {
    // "/folder/:id"
    wssF.handleUpgrade(req, socket, head, (ws) => {
      wssF.on('connection', () => {
        console.log("Client Connected!! on F")
        ws.on('error', console.error);
      });
      wssF.emit('connection');
    });
  } else {
    socket.destroy();
  }
}

export default wsRoute;