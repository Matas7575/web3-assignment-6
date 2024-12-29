This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Project Overview

## Architecture Walkthrough

### Project Structure

The project is organized as follows:
- **app/**: Contains the main application setup.
- **components/**: Reusable UI components.
- **context/**: Context providers for global state management.
- **hooks/**: Custom hooks for encapsulating logic.
- **pages/**: Next.js pages.
- **services/**: API service functions.
- **styles/**: CSS and styling files.

### Data Flow

1. **User Authentication**: 
   - The [`Home`](src/pages/index.tsx) component handles user login and stores the username in localStorage.
   - The [`useUser`](src/context/UserContext.tsx) hook provides user context throughout the app.

2. **Real-time Lobby Updates**:
   - The [`Home`](src/pages/index.tsx) component initializes a Socket.IO connection to fetch and update the list of game lobbies in real-time.
   - The [`useGameSocket`](src/hooks/useGameSocket.ts) hook manages the socket connection for game updates.

3. **Game Management**:
   - The `GameContext` provides state management for game-related data such as players and dice.
   - The `gameService` handles API requests for game data.

### Reactive Programming Example

Reactive programming is used to handle real-time updates and state management. Here is an example:

#### [`useGameSocket`](src/hooks/useGameSocket.ts) Hook

```typescript
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Game } from "@/pages/api/games/types";

interface GameUpdate {
  type: string;
  game: Game;
}

const useGameSocket = (gameId: string, onGameUpdate: (game: Game) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!gameId) return;

    socketRef.current = io("http://localhost:3000");
    socketRef.current.emit("joinGameRoom", gameId);

    socketRef.current.on("gameUpdate", (data: GameUpdate) => {
      if (data.type === "update" && data.game.id === gameId) {
        onGameUpdate(data.game);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [gameId, onGameUpdate]);

  return socketRef.current;
};

export default useGameSocket;
```

### Technical Decisions
1. **Next.js**: Chosen for its server-side rendering capabilities and ease of use with React.
2. **Socket.IO**: Used for real-time communication between the client and server.
3. **Context API**: Utilized for global state management, providing a simple and efficient way to share state across components.
4. **TypeScript**: Ensures type safety and improves code quality.
