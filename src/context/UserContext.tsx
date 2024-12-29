"use client";
import React, { createContext, useState, useContext } from "react";

/**
 * Defines the shape of the user context state.
 * 
 * @interface UserContextType
 * @property {string} username - The current username
 * @property {(username: string) => void} setUsername - Function to update the username
 * @category Context
 */
interface UserContextType {
  username: string;
  setUsername: (username: string) => void;
}

// Create the context
const UserContext = createContext<UserContextType | null>(null);

// Provider component
/**
 * Provider component for user state management.
 * 
 * @param {object} props - The properties for the provider component.
 * @param {React.ReactNode} props.children - Child components that will have access to the user state.
 * @returns {JSX.Element} - Rendered provider component.
 * @category Context
 */
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
/**
 * Custom hook to access the user context.
 * Must be used within a UserProvider component.
 * 
 * @returns {UserContextType} - The user context value.
 * @throws {Error} - If used outside of a UserProvider.
 * @category Context
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};