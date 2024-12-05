"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

const Home = () => {
  const [localUsername, setLocalUsername] = useState("");
  const { setUsername } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   const savedUsername = localStorage.getItem("username");
  //   if (savedUsername) {
  //     setUsername(savedUsername); // Set username in context
  //     router.push("/lobby"); // Redirect to lobby
  //   }
  // }, [setUsername, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUsername) {
      setUsername(localUsername);
      localStorage.setItem("username", localUsername); // Save username
      router.push("/lobby"); // Redirect to lobby
    } else {
      alert("Please enter a username.");
    }
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
    </div>
  );
};

export default Home;
