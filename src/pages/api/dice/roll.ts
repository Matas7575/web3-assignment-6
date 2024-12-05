import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { sides } = req.body;
    if (!sides || typeof sides !== "number") {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const result = Math.floor(Math.random() * sides) + 1;
    res.status(200).json({ result });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
