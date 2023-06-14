import { createRef, useEffect } from "react";
import Mongoose from "mongoose";
import { io } from "socket.io-client";
import { getAllBookmarks, getAllTags } from "database";
import { observer } from "mobx-react-lite";
import { useStores } from "store";
import { Drawer, BookmarkContainer, TopBar, View } from "components";
import { CONSTANTS, makeClasses } from "utils";
import env from "../env/index.js";

export const Home = observer(() => {
  const drawerRef = createRef();

  const { bookmarkStore, homeStore, tagStore } = useStores();

  const { css } = useClasses({
    drawerMode: homeStore.drawerMode,
    drawerWidth: 200,
    isDrawerOpen: homeStore.isDrawerOpen,
  });

  useEffect(() => {
    document.title = "Home";
    console.debug("Home window useEffect fired.");

    const loadStores = async (databaseUri: string) => {
      try {
        console.debug("Connecting to database:", databaseUri, "...");
        await Mongoose.connect(databaseUri, CONSTANTS.MONGOOSE_OPTS);

        console.debug("Connected to database. Retrieving data...");
        const [bookmarks, tags] = await Promise.all([getAllBookmarks(), getAllTags()]);

        console.debug("Data retrieved. Storing in MobX...");

        tagStore.overwrite(tags);
        bookmarkStore.overwrite(bookmarks);

        console.debug("Data stored in MobX.");
      } catch (err) {
        console.error(err);
      }
    };

    const connectToSocket = async () => {
      try {
        console.debug("Pinging server...");
        const res = await (
          await fetch(`http://localhost:${env.SERVER_PORT}/api/ping`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ msg: "pong" }),
          })
        ).json();
        console.debug("Ping response:", res);

        console.debug(`Connecting to socket on port ${env.SOCKET_PORT}...`);
        const socket = io(`http://localhost:${env.SOCKET_PORT}`);

        socket.on("connected", () => console.debug("Socket.io connected."));

        socket.on("dbConnected", (databaseUri) => loadStores(databaseUri));

        socket.on("createBookmark", (bookmark) => console.debug({ bookmark }));
      } catch (err) {
        console.error(err);
      }
    };

    connectToSocket();
  }, []);

  return (
    <>
      <Drawer ref={drawerRef} />

      <View className={css.main}>
        <TopBar />
        <BookmarkContainer />
      </View>
    </>
  );
});

const useClasses = makeClasses((_, { drawerMode, drawerWidth, isDrawerOpen }) => ({
  main: {
    display: "flex",
    flexFlow: "column",
    marginLeft: drawerMode === "persistent" && isDrawerOpen ? drawerWidth : 0,
    width:
      drawerMode === "persistent" && isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : "inherit",
    height: "inherit",
    transition: "all 225ms ease-in-out",
  },
}));
