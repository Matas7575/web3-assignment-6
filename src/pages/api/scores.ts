import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { playerId, score } = req.body;
    if (!playerId || typeof score !== "number") {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    // Update the score (mock logic here)
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
