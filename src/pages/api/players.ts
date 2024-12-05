import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const players = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    res.status(200).json(players);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
