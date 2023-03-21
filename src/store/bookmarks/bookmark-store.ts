import { computed } from "mobx";
import { Model, model, modelAction, ModelCreationData, prop } from "mobx-keystone";
import { Bookmark } from ".";
import { dayjs } from "utils";
import { toast } from "react-toastify";

@model("markII/BookmarkStore")
export class BookmarkStore extends Model({
  bookmarks: prop<Bookmark[]>(() => []),
}) {
  @modelAction
  addBookmarks(...bookmarks: ModelCreationData<Bookmark>[]) {
    this.bookmarks.push(...bookmarks.map((f) => new Bookmark(f)));
  }

  @modelAction
  archiveBookmarks(bookmarkIds: string[], isUnarchive = false) {
    if (!bookmarkIds?.length) return false;
    this.bookmarks.forEach((b) => {
      if (bookmarkIds.includes(b.id)) {
        b.isArchived = !isUnarchive;
        b.isSelected = false;
      }
    });
    toast.warning(`${isUnarchive ? "Unarchived" : "Archived"} ${bookmarkIds.length} bookmarks`);
  }

  @modelAction
  deleteBookmarks(bookmarkIds: string[]) {
    if (!bookmarkIds?.length) return false;
    this.bookmarks = this.bookmarks.filter((b) => !bookmarkIds.includes(b.id));
    toast.error(`Deleted ${bookmarkIds.length} bookmarks`);
  }

  @modelAction
  editBookmarkTags({
    addedIds = [],
    dateModified = dayjs().toISOString(),
    bookmarkIds = [],
    removedIds = [],
  }: {
    addedIds?: string[];
    dateModified?: string;
    bookmarkIds?: string[];
    removedIds?: string[];
  }) {
    if (!addedIds?.length && !removedIds?.length) return false;

    this.bookmarks.forEach((b) => {
      if (!bookmarkIds.length || bookmarkIds.includes(b.id)) {
        b.tagIds = [...b.tagIds, ...addedIds].filter((id) => !removedIds.includes(id));
        b.dateModified = dateModified;
      }
    });
  }

  @modelAction
  overwrite(bookmarks: ModelCreationData<Bookmark>[]) {
    this.bookmarks = bookmarks.map((b) => new Bookmark(b));
  }

  @modelAction
  setBookmarkRatings(bookmarkIds: string[], rating: number, dateModified = dayjs().toISOString()) {
    if (!bookmarkIds?.length) return false;
    this.bookmarks.forEach((b) => {
      if (bookmarkIds.includes(b.id)) {
        b.rating = rating;
        b.dateModified = dateModified;
      }
    });
  }

  @modelAction
  toggleBookmarksSelected(selected: { id: string; isSelected?: boolean }[]) {
    const selectedIds = selected.map((s) => s.id);
    this.bookmarks.forEach((b) => {
      if (selectedIds.includes(b.id)) {
        const selectedBookmark = selected.find((s) => s.id === b.id);
        b.isSelected = selectedBookmark.isSelected ?? !b.isSelected;
      }
    });
  }

  getById(id: string) {
    return this.bookmarks.find((b) => b.id === id);
  }

  listByHash(hash: string) {
    return this.bookmarks.filter((b) => b.imageHash === hash);
  }

  listByTagId(tagId: string) {
    return this.bookmarks.filter((b) => b.tagIds.includes(tagId));
  }

  @computed
  get archived() {
    return this.bookmarks.filter((b) => b.isArchived);
  }

  @computed
  get selected() {
    return this.bookmarks.filter((b) => b.isSelected);
  }
}
