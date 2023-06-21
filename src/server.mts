import path from "path";
import fs from "fs/promises";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import Mongoose from "mongoose";
import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import superjson from "superjson";
import { getAllBookmarks, getAllTags } from "./database";
import { CONSTANTS, logToFile } from "./utils";
import env from "./env";

/* ----------------------------- DATABASE SERVER ---------------------------- */
const createDbServer = async () => {
  logToFile("debug", "Creating Mongo server...");
  const dbPath = env.DB_PATH || path.join(path.resolve(), "MongoDB", "mark-ii");
  const port = +env.DB_PORT || 27071;

  const dbPathExists = await fs.stat(dbPath).catch(() => false);
  if (!dbPathExists) await fs.mkdir(dbPath, { recursive: true });

  const mongoServer = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbPath, port, storageEngine: "wiredTiger" }],
    replSet: { dbName: "mark-ii", name: "rs-mark-ii" },
  });

  const databaseUri = mongoServer.getUri();
  logToFile("debug", "Mongo server created:", databaseUri);

  logToFile("debug", "Connecting to database:", databaseUri, "...");
  await Mongoose.connect(databaseUri, CONSTANTS.MONGOOSE_OPTS);
  logToFile("debug", "Connected to database.");
};

/* ----------------------------- API / tRPC ROUTER ------------------------------ */
const t = initTRPC.create({ transformer: superjson });

const tRouter = t.router;
const tProc = t.procedure;

const trpcRouter = tRouter({
  listBookmarks: tProc.query(getAllBookmarks),
  listTags: tProc.query(getAllTags),
});
export type TRPCRouter = typeof trpcRouter;

/* ----------------------------- CREATE SERVER ----------------------------- */
export let server = null;

module.exports = (async () => {
  logToFile("debug", "Creating database server...");
  await createDbServer();
  logToFile("debug", "Database server created.");

  logToFile("debug", "Creating tRPC server...");
  server = createHTTPServer({ router: trpcRouter });

  const serverPort = +env.SERVER_PORT || 3738;
  server.listen(serverPort, () => logToFile("debug", `Listening on port ${serverPort}...`));

  logToFile("debug", "tRPC server created.");
  logToFile("debug", "Servers created.");

  return { server, trpcRouter };
})();
