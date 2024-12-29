"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { io } from "socket.io-client";

let socket: any;

/**
 * Home component to manage the main page of the application.
 */
const Home = () => {
  const [localUsername, setLocalUsername] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
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

    // Listen for game updates from the server
    socket.on("gameUpdate", (data: any) => {
      console.log("Received game update:", data);
      if (data.type === "update") {
        setLobbies(data.game);
        console.log("Lobbies updated:", data.game);
      }
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Handles user login.
   * 
   * @param {React.FormEvent} e - The form event.
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUsername) {
      setUsername(localUsername);
      localStorage.setItem("username", localUsername); // Save username
      setLoginSuccess(true); // Set login success to true
    } else {
      alert("Please enter a username.");
    }
  };

  /**
   * Handles joining a lobby.
   * 
   * @param {string} gameId - The ID of the game to join.
   */
  const handleJoinLobby = async (gameId: string) => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      alert("Please log in with a username first.");
      return;
    }

    try {
      const response = await fetch("/api/games", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, username: storedUsername, action: "join" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join the lobby.");
      }

      router.push(`/lobby/${gameId}`);
    } catch (error: any) {
      console.error(`Error joining lobby '${gameId}':`, error);
      alert(error.message || "An error occurred while joining the lobby.");
    }
  };

  /**
   * Handles creating a new lobby.
   */
  const handleCreateLobby = async () => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      alert("Please log in with a username first.");
      return;
    }

    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: storedUsername }),
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
        <button type="submit">Login</button>
      </form>
      {loginSuccess && <p>Login successful!</p>}

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