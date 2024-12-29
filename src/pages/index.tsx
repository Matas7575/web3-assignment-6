"use client";

import type { NextPage } from 'next';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { io, Socket } from "socket.io-client";
import styles from '@/styles/Home.module.css';
import { Game } from "@/pages/api/games/types";

let socket: Socket | null = null;

/**
 * Interface for error responses from the server.
 * 
 * @interface ErrorResponse
 * @property {string} error - The error message.
 * @category Types
 */
interface ErrorResponse {
  error: string;
}

/**
 * The main landing page component.
 * Handles user authentication and game lobby management.
 * 
 * Features:
 * - User login functionality
 * - Display of available game lobbies
 * - Creation of new game lobbies
 * - Joining existing games
 * 
 * @module Pages
 * @category Game
 * @example
 * // Page is accessed via root URL: /
 * // Internal route configuration
 * {
 *   path: '/',
 *   component: Home
 * }
 * 
 * @remarks
 * - Stores username in localStorage
 * - Updates lobby list in real-time
 * - Handles lobby creation and joining
 */
const Home: NextPage = () => {
  const [localUsername, setLocalUsername] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { setUsername } = useUser();
  const router = useRouter();
  const [lobbies, setLobbies] = useState<Game[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection and fetch lobbies
  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket: Socket = io("http://localhost:3000");
    setSocket(newSocket);

    // Initial fetch of lobbies
    const fetchLobbies = async () => {
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        console.log('Fetched lobbies:', data);
        setLobbies(data);
      } catch (error) {
        console.error('Error fetching lobbies:', error);
      }
    };

    fetchLobbies();

    // Listen for lobby updates
    newSocket.on("gameUpdate", (data: { type: string; game: Game }) => {
      console.log("Received game update:", data);
      if (data.type === "update") {
        // Update the specific lobby in the list
        setLobbies(prevLobbies => {
          const updatedLobbies = [...prevLobbies];
          const index = updatedLobbies.findIndex(lobby => lobby.id === data.game.id);
          if (index !== -1) {
            updatedLobbies[index] = data.game;
          } else {
            updatedLobbies.push(data.game);
          }
          return updatedLobbies;
        });
      }
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, []);

  /**
   * Handles user login form submission.
   * Validates and stores the username.
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUsername) {
      setUsername(localUsername);
      localStorage.setItem("username", localUsername);
      setLoginSuccess(true);
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
        body: JSON.stringify({ 
          gameId, 
          username: storedUsername, 
          action: "join" 
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to join the lobby.");
      }
    
      const data = await response.json() as Game;
      console.log('Successfully joined lobby:', data);
      router.push(`/lobby/${gameId}`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error joining lobby '${gameId}':`, error);
      alert(err.message || "An error occurred while joining the lobby.");
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

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: storedUsername }),
      });

      const newLobby = await response.json();
      console.log('Created new lobby:', newLobby);
      router.push(`/lobby/${newLobby.id}`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert("Failed to create lobby.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Welcome to Yahtzee!</h1>
      
      {/* Login Form */}
      <form onSubmit={handleLogin} className={styles.form}>
        <input
          type="text"
          value={localUsername}
          onChange={(e) => setLocalUsername(e.target.value)}
          placeholder="Enter your username"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Login</button>
      </form>
      
      {loginSuccess && <p className={styles.successMessage}>Login successful!</p>}

      {/* Lobbies List */}
      <h2 className={styles.heading}>Available Lobbies</h2>
      <div className={styles.lobbies}>
        <ul className={styles.lobbiesList}>
          {lobbies.length > 0 ? (
            lobbies.map((lobby) => (
              <li key={lobby.id} className={styles.lobbyItem}>
                <div className={styles.lobbyInfo}>
                  <span className={styles.lobbyName}>{lobby.name}</span>
                  <span className={styles.playerCount}>
                    Players: {lobby.players.join(', ')} ({lobby.players.length})
                  </span>
                </div>
                <button 
                  onClick={() => handleJoinLobby(lobby.id)} 
                  className={styles.button}
                  disabled={lobby.players.includes(localStorage.getItem("username") || "")}
                >
                  {lobby.players.includes(localStorage.getItem("username") || "") 
                    ? "Already Joined" 
                    : "Join"}
                </button>
              </li>
            ))
          ) : (
            <li className={styles.lobbyItem}>No lobbies available</li>
          )}
        </ul>
      </div>

      <button 
        onClick={handleCreateLobby} 
        className={`${styles.button} ${styles.createButton}`}
      >
        Create a New Lobby
      </button>
    </div>
  );
};

export default Home;