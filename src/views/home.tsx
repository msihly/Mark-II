import { createRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "store";
import { Drawer, BookmarkContainer, TopBar, View } from "components";
import { makeClasses, trpc } from "utils";

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

    const loadStores = async () => {
      try {
        const [bookmarks, tags] = await Promise.all([
          trpc.listBookmarks.query(),
          trpc.listTags.query(),
        ]);

        console.debug("Data retrieved. Storing in MobX...");
        tagStore.overwrite(tags);
        bookmarkStore.overwrite(bookmarks);

        console.debug("Data stored in MobX.");
      } catch (err) {
        console.error(err);
      }
    };

    loadStores();
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
