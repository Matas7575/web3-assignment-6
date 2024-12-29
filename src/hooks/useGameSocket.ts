import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Custom hook to manage a game socket connection.
 * 
 * @param {string} gameId - The ID of the game to join.
 * @param {function} onGameUpdate - Callback function to handle game updates.
 * @returns {Socket | null} - The socket instance.
 */
const useGameSocket = (gameId: string, onGameUpdate: (game: any) => void) => {
  // Reference to store the socket instance
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // If no gameId is provided, do nothing
    if (!gameId) return;

    // Initialize socket connection to the server
    socketRef.current = io("http://localhost:3000");

    // Emit an event to join the specific game room
    socketRef.current.emit("joinGameRoom", gameId);

    // Listen for game updates from the server
    socketRef.current.on("gameUpdate", (data: any) => {
      // Check if the update is for the current game
      if (data.type === "update" && data.game.id === gameId) {
        // Call the callback function with the updated game data
        onGameUpdate(data.game);
      }
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socketRef.current?.disconnect();
    };
  }, [gameId, onGameUpdate]);

  // Return the socket instance
  return socketRef.current;
};

export default useGameSocket;