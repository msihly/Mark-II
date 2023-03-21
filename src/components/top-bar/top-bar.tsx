import { observer } from "mobx-react-lite";
import { useStores } from "store";
import { deleteBookmarks, RefreshBookmarkQueue, refreshBookmark } from "database";
import { AppBar, Chip, colors } from "@mui/material";
import { IconButton, Tagger, View } from "components";
import { SortMenu } from ".";
import { makeClasses } from "utils";
import { toast } from "react-toastify";

export const TopBar = observer(() => {
  const { bookmarkStore, homeStore, tagStore } = useStores();
  const { css } = useClasses(null);

  const hasNoSelection = bookmarkStore.selected.length === 0;

  const handleDelete = () => deleteBookmarks(bookmarkStore, bookmarkStore.selected);

  const handleEditTags = () => tagStore.setIsTaggerOpen(true);

  const handleBookmarkInfoRefresh = () => {
    bookmarkStore.selected.map((f) =>
      RefreshBookmarkQueue.add(() => refreshBookmark(bookmarkStore, f.id))
    );
    toast.info(`Refreshing ${bookmarkStore.selected?.length} bookmarks' info...`);
  };

  const handleDeselectAll = () => {
    bookmarkStore.toggleBookmarksSelected(
      bookmarkStore.selected.map(({ id }) => ({ id, isSelected: false }))
    );
    toast.info("Deselected all bookmarks");
  };

  const handleSelectAll = () => {
    bookmarkStore.toggleBookmarksSelected(
      homeStore.displayedBookmarks.map(({ id }) => ({ id, isSelected: true }))
    );
    toast.info(`Added ${homeStore.displayedBookmarks.length} bookmarks to selection`);
  };

  const handleUnarchive = () => deleteBookmarks(bookmarkStore, bookmarkStore.selected, true);

  return (
    <AppBar position="relative" className={css.appBar}>
      <View className={css.container}>
        <View className={css.divisions}>
          {!homeStore.isDrawerOpen && (
            <IconButton name="Menu" onClick={() => homeStore.setIsDrawerOpen(true)} size="medium" />
          )}

          {bookmarkStore.selected?.length > 0 && (
            <Chip label={`${bookmarkStore.selected?.length} Selected`} />
          )}
        </View>

        <View className={css.divisions}>
          {homeStore.isArchiveOpen && (
            <IconButton
              name="Delete"
              onClick={handleDelete}
              disabled={hasNoSelection}
              size="medium"
            />
          )}

          <IconButton
            name={homeStore.isArchiveOpen ? "Unarchive" : "Archive"}
            onClick={homeStore.isArchiveOpen ? handleUnarchive : handleDelete}
            disabled={hasNoSelection}
            size="medium"
          />

          <IconButton
            name="Refresh"
            onClick={handleBookmarkInfoRefresh}
            disabled={hasNoSelection}
            size="medium"
          />

          <IconButton
            name="Label"
            onClick={handleEditTags}
            disabled={hasNoSelection}
            size="medium"
          />

          <IconButton
            name="Deselect"
            onClick={handleDeselectAll}
            disabled={hasNoSelection}
            size="medium"
          />

          <IconButton name="SelectAll" onClick={handleSelectAll} size="medium" />

          <SortMenu />
        </View>
      </View>

      {tagStore.isTaggerOpen && <Tagger bookmarks={bookmarkStore.selected} />}
    </AppBar>
  );
});

const useClasses = makeClasses({
  appBar: {
    display: "flex",
    flexFlow: "row nowrap",
    boxShadow: "rgb(0 0 0 / 50%) 2px 2px 4px 0px",
    zIndex: 5,
  },
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    padding: "0.3rem 0.5rem",
    backgroundColor: colors.grey["900"],
  },
  divisions: {
    display: "inline-flex",
    alignItems: "center",
    "&:first-of-type > *:not(:last-child)": {
      marginRight: "0.5rem",
    },
    "&:last-of-type > *:not(:first-of-type)": {
      marginLeft: "0.5rem",
    },
  },
});
