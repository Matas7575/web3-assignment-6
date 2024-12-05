"use client";
import React, { createContext, useState, useContext } from "react";

// Define the context structure
interface UserContextType {
  username: string;
  setUsername: (username: string) => void;
}

// Create the context
const UserContext = createContext<UserContextType | null>(null);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [username, setUsername] = useState("");

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
