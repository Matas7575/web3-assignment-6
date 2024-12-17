import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const useGameSocket = (gameId: string, onGameUpdate: (game: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!gameId) return;

    // Initialize socket connection
    socketRef.current = io("http://localhost:3000");

    // Join the specific game room
    socketRef.current.emit("joinGameRoom", gameId);

    // Listen for game updates
    socketRef.current.on("gameUpdate", (data: any) => {
      if (data.type === "update" && data.game.id === gameId) {
        onGameUpdate(data.game);
      }
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [gameId, onGameUpdate]);

  return socketRef.current;
};

export default useGameSocket;
