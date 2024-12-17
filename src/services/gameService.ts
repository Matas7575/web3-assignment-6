// services/gameService.ts

export const fetchGame = async (gameId: string) => {
  const response = await fetch(`/api/games?gameId=${gameId}`);
  if (!response.ok) {
    throw new Error(`Error fetching game: ${response.statusText}`);
  }
  return response.json();
};

export const performAction = async (
  gameId: string,
  username: string,
  action: string,
  payload: any = {}
) => {
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
