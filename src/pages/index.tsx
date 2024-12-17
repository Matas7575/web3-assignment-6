"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { io } from "socket.io-client";

let socket: any;

const Home = () => {
  const [localUsername, setLocalUsername] = useState("");
  const { setUsername } = useUser();
  const router = useRouter();

  const [lobbies, setLobbies] = useState<any[]>([]);

  // Fetch the list of lobbies
  useEffect(() => {
    const fetchLobbies = async () => {
      const response = await fetch("/api/games");
      const data = await response.json();
      setLobbies(data);
    };
    fetchLobbies();

    // Connect to the Socket.IO server
    socket = io("http://localhost:3000");

    // Join the room for this game
    // socket.emit("joinGameRoom", lobbyId);

    socket.on("gameUpdate", (data: any) => {
      console.log("Received game update:", data);
      if (data.type === "update") {
        setLobbies(data.game);
        console.log("Lobbies updated:", data.game);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUsername) {
      setUsername(localUsername);
      localStorage.setItem("username", localUsername); // Save username
    } else {
      alert("Please enter a username.");
    }
  };

  const handleJoinLobby = async (gameId: string) => {
    if (!localUsername) {
      alert("Please log in with a username first.");
      return;
    }
    const response = await fetch("/api/games", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, username: localUsername, action: "join" }),
    });

    router.push(`/lobby/${gameId}`);
  };

  const handleCreateLobby = async () => {
    if (!localUsername) {
      alert("Please log in with a username first.");
      return;
    }

    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: localUsername }),
    });

    const newLobby = await response.json();
    router.push(`/lobby/${newLobby.id}`);
  };

  return (
    <div>
      <h1>Welcome to Yahtzee!</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={localUsername}
          onChange={(e) => setLocalUsername(e.target.value)}
          placeholder="Enter your username"
        />
      </form>

      <h2>Available Lobbies</h2>
      <ul>
        {lobbies.length ? (
          lobbies.map((lobby) => (
            <li key={lobby.id}>
              <span>
                {lobby.name} - {lobby.players.length} players
              </span>
              <button onClick={() => handleJoinLobby(lobby.id)}>Join</button>
            </li>
          ))
        ) : (
          <li>No lobbies available</li>
        )}
      </ul>

      <button onClick={handleCreateLobby}>Create a New Lobby</button>
    </div>
  );
};

export default Home;
