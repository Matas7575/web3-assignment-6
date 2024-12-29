import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API handler function to manage authentication requests.
 * 
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { username } = req.body;

    // Validate the username
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

    // Return success response with the username
    return res.status(200).json({ success: true, username });
  }

  // Return method not allowed for non-POST requests
  return res.status(405).json({ message: "Method Not Allowed" });
}