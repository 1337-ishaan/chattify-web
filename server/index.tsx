const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://143.110.246.44:3000",
  },
});

const randomId = () => require("crypto").randomBytes(8).toString("hex");
let sessions = new Map();

const findSession = (id) => {
  return sessions.get(id);
};

const saveSession = (id, session) => {
  sessions.set(id, session);
};

const findAllSessions = () => {
  return [...sessions.values()];
};
// const sessionStore = new InMemorySessionStore();

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // persist session
  saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  // fetch existing users
  const users = [];
  findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
    });
  });
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private message", ({ content, to }) => {
    socket.to(to).to(socket.userID).emit("private message", {
      content,
      from: socket.userID,
      to,
    });
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });
});

const PORT = process.env.PORT || 3010;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);
