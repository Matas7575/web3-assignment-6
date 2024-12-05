import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { username } = req.body;

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length < 3
    ) {
      return res
        .status(400)
        .json({
          message: "Invalid username. Must be at least 3 characters long.",
        });
    }

    return res.status(200).json({ success: true, username });
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
