import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Interface for the socket request object.
 * 
 * @interface SocketRequest
 * @extends {NextApiRequest}
 * @property {object} socket - The socket object
 * @property {HttpServer} socket.server - The HTTP server instance
 * @category Types
 */
interface SocketRequest extends NextApiRequest {
  socket: Socket & {
    server: HttpServer & { io?: SocketIOServer };
  };
}

/**
 * API handler function to manage WebSocket connections.
 * 
 * @param {SocketRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
export default function SocketHandler(req: SocketRequest, res: NextApiResponse) {
  // Check if the global socket.io instance is already initialized
  if (!req.socket.server.io) {
    // Initialize a new socket.io server instance
    const io = new SocketIOServer(req.socket.server);
    req.socket.server.io = io;

    // Handle new client connections
    io.on('connection', (socket) => {
      console.log('New client connected');

      // Handle client joining a game room
      socket.on('joinGameRoom', (gameId: string) => {
        socket.join(gameId);
        console.log(`Client joined room: ${gameId}`);
      });

      // Handle client disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  } else {
    console.log('Socket.io server already initialized');
  }

  // End the response
  res.end();
}