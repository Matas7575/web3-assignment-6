import GameBoard from "@/components/common/GameBoard";
import { useRouter } from "next/router";

const GamePage = () => {
  const router = useRouter();
  const { id: gameId } = router.query;

  return (
    <div>
      <h1>Game ID: {gameId}</h1>
      {gameId && <GameBoard gameId={gameId as string} />}
    </div>
  );
};

export default GamePage;
