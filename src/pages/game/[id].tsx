import GameBoard from "@/components/GameBoard";
import { useRouter } from "next/router";

const GamePage = () => {
  const router = useRouter();
  const { id: gameId } = router.query;

  return (
    <div>
      <h1>Game ID: {gameId}</h1>
      <GameBoard />
    </div>
  );
};

export default GamePage;
