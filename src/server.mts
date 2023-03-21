import * as dotenv from "dotenv";
dotenv.config();
const { DB_PATH, DB_PORT, SERVER_PORT, SOCKET_PORT } = process.env;
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Server, Socket } from "socket.io";

/* ----------------------------- DATABASE SERVER ---------------------------- */
const createDbServer = async (socket: Socket) => {
  console.debug("Creating Mongo server...");
  const dbPath = DB_PATH || path.join(path.resolve(), "MongoDB", "mark-ii");
  const port = +DB_PORT || 27070;

  const dbPathExists = await fs.stat(dbPath).catch(() => false);
  if (!dbPathExists) await fs.mkdir(dbPath, { recursive: true });

  const mongoServer = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbPath, port, storageEngine: "wiredTiger" }],
    replSet: { dbName: "mark-ii", name: "rs-mark-ii" },
  });

  const databaseUri = mongoServer.getUri();

  console.debug("Mongo server created:", databaseUri);

  socket.emit("dbConnected", databaseUri);
};

/* -------------------------------- SOCKET.IO ------------------------------- */
const io = new Server(+SOCKET_PORT);

io.on("connection", (socket) => {
  socket.emit("connected");

  createDbServer(socket);
});

/* ----------------------------- EXPRESS SERVER ----------------------------- */
const createExpressServer = async () => {
  const server = express();

  server.use(express.json({ limit: "5mb" }));

  server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Authorization, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  const DIR_NAME = path.dirname(fileURLToPath(import.meta.url));
  server.use(express.static(path.join(DIR_NAME, "../build")));

  server.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}...`));

  /* ----------------------------------- API ---------------------------------- */
  server.post("/api/bookmark", async (req, res) => {
    try {
      const { isIncognito, imageUrl, pageUrl, title } = req.body;

      io.sockets.emit("createBookmark", { isIncognito, imageUrl, pageUrl, title });

      return res.send({ success: true, isIncognito, imageUrl, pageUrl, title });
    } catch (err) {
      console.error(err);
    }
  });
};

createExpressServer();
