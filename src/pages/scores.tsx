import { useEffect, useState } from "react";

interface Score {
  id: string;
  player: string;
  points: number;
}

const ScoresPage = () => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      const response = await fetch("/api/scores");
      const data = await response.json();
      setScores(data);
    };
    fetchScores();
  }, []);

  return (
    <div>
      <h1>Game Scores</h1>
      <ul>
        {scores.map((score) => (
          <li key={score.id}>
            {score.player}: {score.points}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoresPage;
