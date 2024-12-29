import { Game } from "@/pages/api/games/types";

interface ActionPayload {
  gameId: string;
  username: string;
  action: string;
  [key: string]: unknown;
}

/**
 * Fetches the game data for a given game ID.
 * 
 * @param {string} gameId - The ID of the game to fetch.
 * @returns {Promise<any>} - A promise that resolves to the game data.
 * @throws {Error} - Throws an error if the fetch request fails.
 */
export const fetchGame = async (gameId: string): Promise<Game> => {
  const response = await fetch(`/api/games?gameId=${gameId}`);
  if (!response.ok) {
    throw new Error(`Error fetching game: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Performs an action in the game.
 * 
 * @param {string} gameId - The ID of the game.
 * @param {string} username - The username of the player performing the action.
 * @param {string} action - The action to perform.
 * @param {Game} [payload={}] - The payload for the action.
 * @returns {Promise<Game>} - A promise that resolves to the updated game data.
 * @throws {Error} - Throws an error if the action request fails.
 */
export const performAction = async (
  gameId: string,
  username: string,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<Game> => {
  const response = await fetch(`/api/games`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, username, action, ...payload }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Unknown error");
  }

  return response.json();
};