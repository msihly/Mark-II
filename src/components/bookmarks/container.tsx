import { useEffect, useRef } from "react";
import { setBookmarkRating } from "database";
import { observer } from "mobx-react-lite";
import { sortBookmarks, useStores } from "store";
import Selecto, { OnDragStart, OnSelect } from "react-selecto";
import { Pagination, colors } from "@mui/material";
import { View } from "components";
import { DisplayedBookmarks } from ".";
import { CONSTANTS, makeClasses } from "utils";

export const BookmarkContainer = observer(() => {
  const { css } = useClasses(null);
  const { bookmarkStore, homeStore, tagStore } = useStores();

  const pageCount =
    homeStore.filteredBookmarks.length < CONSTANTS.BOOKMARK_COUNT
      ? 1
      : Math.ceil(homeStore.filteredBookmarks.length / CONSTANTS.BOOKMARK_COUNT);

  const selectRef = useRef(null);
  const selectoRef = useRef(null);

  useEffect(() => {
    if (homeStore.page > pageCount) homeStore.setPage(pageCount);
  }, [homeStore.page, pageCount]);

  useEffect(() => {
    if (bookmarkStore.selected.length === 0) selectoRef.current?.setSelectedTargets?.([]);
  }, [bookmarkStore.selected.length]);

  const handleKeyPress = (e) => {
    if (e.key === "t" && !tagStore.isTaggerOpen) {
      e.preventDefault();
      tagStore.setIsTaggerOpen(true);
    } else if (bookmarkStore.selected.length === 1) {
      const selectedId = bookmarkStore.selected[0].id;
      const indexOfSelected = homeStore.filteredBookmarks.findIndex((f) => f.id === selectedId);
      const nextIndex =
        indexOfSelected === homeStore.filteredBookmarks.length - 1 ? 0 : indexOfSelected + 1;
      const nextId = homeStore.filteredBookmarks[nextIndex].id;
      const prevIndex =
        indexOfSelected === 0 ? homeStore.filteredBookmarks.length - 1 : indexOfSelected - 1;
      const prevId = homeStore.filteredBookmarks[prevIndex].id;

      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        const newId = e.key === "ArrowLeft" ? prevId : nextId;
        if (!homeStore.displayedBookmarks.find((f) => f.id === newId))
          homeStore.setPage(homeStore.page + 1 * (e.key === "ArrowLeft" ? -1 : 1));

        bookmarkStore.toggleBookmarksSelected([
          { id: selectedId, isSelected: false },
          { id: newId, isSelected: true },
        ]);
      } else if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
        setBookmarkRating(bookmarkStore, [selectedId], +e.key);
      }
    }
  };

  const handleSelect = (event: OnDragStart | OnSelect) => {
    const curSelectedIds = event.currentTarget.getSelectedTargets().map((e) => e.id);
    const selectedDisplayed = homeStore.displayedBookmarks.filter((f) => f.isSelected);

    if (event.inputEvent?.shiftKey) {
      const sortedSelected = bookmarkStore.selected.sort((a, b) =>
        sortBookmarks({ a, b, isSortDesc: homeStore.isSortDesc, sortKey: homeStore.sortKey })
      );

      const endId = sortedSelected[sortedSelected.length - 1]?.id;
      const endIndex = homeStore.filteredBookmarks.findIndex((f) => f.id === endId);
      const firstId = sortedSelected[0]?.id;
      const firstIndex = homeStore.filteredBookmarks.findIndex((f) => f.id === firstId);
      const selectedId = event.inputEvent?.path?.find((el) =>
        el.classList?.value?.includes?.("selectable")
      )?.id;
      const selectedIndex = homeStore.filteredBookmarks.findIndex((f) => f.id === selectedId);

      const selectedBookmarks = homeStore.filteredBookmarks
        .slice(firstIndex, selectedIndex + 1)
        .map((f) => ({ id: f.id, isSelected: true }));

      const unselectedBookmarks = homeStore.filteredBookmarks
        .slice(selectedIndex, endIndex + 1)
        .map((f) => ({ id: f.id, isSelected: false }));

      bookmarkStore.toggleBookmarksSelected([...selectedBookmarks, ...unselectedBookmarks]);
      event.currentTarget.setSelectedTargets(
        selectedBookmarks.map((f) => document.getElementById(f.id))
      );
    } else if (curSelectedIds?.length > 0) {
      const toggledBookmarks = [
        ...curSelectedIds.map((id) => ({ id, isSelected: true })),
        ...selectedDisplayed.reduce((acc, cur) => {
          if (cur.isSelected && !curSelectedIds.includes(cur.id))
            acc.push({ id: cur.id, isSelected: false });
          return acc;
        }, [] as { id: string; isSelected: boolean }[]),
      ];

      bookmarkStore.toggleBookmarksSelected(toggledBookmarks);
      event.currentTarget.setSelectedTargets(
        curSelectedIds.map((id) => document.getElementById(id))
      );
    }
  };

  const handleScroll = (e) => selectRef.current.scrollBy(e.direction[0] * 10, e.direction[1] * 10);

  return (
    <View className={css.container}>
      <Selecto
        ref={selectoRef}
        dragContainer={selectRef.current}
        onSelect={handleSelect}
        selectableTargets={[".selectable"]}
        continueSelect={false}
        toggleContinueSelect={[["ctrl"], ["shift"]]}
        hitRate={0}
        scrollOptions={{ container: selectRef.current, throttleTime: 15 }}
        onScroll={handleScroll}
      />

      <View ref={selectRef} onKeyDown={handleKeyPress} tabIndex={1} className={css.bookmarks}>
        <DisplayedBookmarks />
      </View>

      <Pagination
        count={pageCount}
        page={homeStore.page}
        onChange={(_, value) => homeStore.setPage(value)}
        showFirstButton
        showLastButton
        className={css.pagination}
      />
    </View>
  );
});

const useClasses = makeClasses({
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "auto",
  },
  bookmarks: {
    display: "flex",
    flexFlow: "row wrap",
    paddingBottom: "3rem",
    overflowY: "auto",
  },
  pagination: {
    position: "absolute",
    bottom: "0.5rem",
    left: 0,
    right: 0,
    borderRadius: "2rem",
    margin: "0 auto",
    padding: "0.3rem",
    width: "fit-content",
    backgroundColor: colors.grey["900"],
  },
});
