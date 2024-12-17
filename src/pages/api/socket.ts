import { Server } from "socket.io";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(req: any, res: NextApiResponse) {
  if (!global._io) {
    if (!res.socket) {
      res.status(500).send("Socket not found");
      return;
    }
    const io = new Server((res.socket as any).server);
    global._io = io;

    io.on("connection", (socket) => {
      console.log("New client connected");

      socket.on("joinGameRoom", (gameId: string) => {
        socket.join(gameId);
        console.log(`Client joined room: ${gameId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  res.end();
}
