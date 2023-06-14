import logToFile from "electron-log";
import { app } from "electron";
import express from "express";
import path from "path";
import fs from "fs/promises";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Server, Socket } from "socket.io";

const envPath = app.isPackaged
  ? path.resolve(process.resourcesPath, "extraResources/env/index.js")
  : path.join(__dirname, "../extraResources/env/index.js");

const loadEnv = async () => (await import(envPath))?.default ?? {};

const debug = (...args: string[]) => {
  console.debug(...args);
  logToFile.debug(...args);
};

const error = (...args: string[]) => {
  console.error(...args);
  logToFile.error(...args);
};

/* ----------------------------- DATABASE SERVER ---------------------------- */
const createDbServer = async (socket: Socket) => {
  debug("Creating Mongo server...");
  const { DB_PATH, DB_PORT } = await loadEnv();
  const dbPath = DB_PATH || path.join(path.resolve(), "MongoDB", "mark-ii");
  const port = +DB_PORT || 27071;

  debug(dbPath);

  const dbPathExists = await fs.stat(dbPath).catch(() => false);
  if (!dbPathExists) await fs.mkdir(dbPath, { recursive: true });

  const mongoServer = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbPath, port, storageEngine: "wiredTiger" }],
    replSet: { dbName: "mark-ii", name: "rs-mark-ii" },
  });

  const databaseUri = mongoServer.getUri();
  socket.emit("dbConnected", databaseUri);
  debug("Mongo server created:", databaseUri);
};

let io: Server = null;
let server: express.Express = null;

/* ----------------------------- EXPRESS SERVER ----------------------------- */
const createServers = async () => {
  const { SOCKET_PORT } = await loadEnv();
  const ioPort = +SOCKET_PORT || 3001;

  debug(`Creating Socket.io server on port ${ioPort}...`);
  io = new Server(ioPort);

  io.on("connection", (socket) => {
    socket.emit("connected");
    debug("Socket.io connected.");
    createDbServer(socket);
  });
  debug("Socket.io server created.");

  debug("Creating Express server...");
  server = express();

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

  server.use(express.static(path.join(__dirname, "../build")));

  const { SERVER_PORT } = await loadEnv();
  const serverPort = +SERVER_PORT || 3738;
  server.listen(serverPort, () => debug(`Listening on port ${serverPort}...`));

  /* ----------------------------------- API ---------------------------------- */
  server.post("/api/ping", async (req, res) => {
    try {
      const { msg } = req.body;
      return res.send({ success: true, body: msg });
    } catch (err) {
      error(err);
    }
  });

  server.post("/api/bookmark", async (req, res) => {
    try {
      const { isIncognito, imageUrl, pageUrl, title } = req.body;

      io.sockets.emit("createBookmark", { isIncognito, imageUrl, pageUrl, title });

      return res.send({ success: true, isIncognito, imageUrl, pageUrl, title });
    } catch (err) {
      error(err);
    }
  });

  debug("Express server created.");
  debug("Servers created.");
};

createServers();
