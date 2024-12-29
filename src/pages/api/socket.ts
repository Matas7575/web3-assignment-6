import { Server } from "socket.io";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API handler function to manage WebSocket connections.
 * 
 * @param {any} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
export default function SocketHandler(req: any, res: NextApiResponse) {
  // Check if the global socket.io instance is already initialized
  if (!global._io) {
    // Ensure the response socket is available
    if (!res.socket) {
      res.status(500).send("Socket not found");
      return;
    }

    // Initialize a new socket.io server instance
    const io = new Server((res.socket as any).server);
    global._io = io;

    // Handle new client connections
    io.on("connection", (socket) => {
      console.log("New client connected");

      // Handle client joining a game room
      socket.on("joinGameRoom", (gameId: string) => {
        socket.join(gameId);
        console.log(`Client joined room: ${gameId}`);
      });

      // Handle client disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  // End the response
  res.end();
}