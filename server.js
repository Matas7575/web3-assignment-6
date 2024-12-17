// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let games = []; // Your in-memory state

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  // Store the `io` globally or attach to `global` so your API routes can access it
  global._io = io;

  io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);
    // Listen for room join requests
    socket.on("joinGameRoom", (gameId) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} joined room ${gameId}`);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
