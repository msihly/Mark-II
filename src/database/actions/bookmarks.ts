import { promises as fs } from "fs";
import md5File from "md5-file";
import { Bookmark, BookmarkModel } from "database";
import { BookmarkStore } from "store";
import { checkFileExists, copyFile, dayjs, PromiseQueue, splitArray } from "utils";

export const deleteBookmarks = async (
  bookmarkStore: BookmarkStore,
  bookmarks: Bookmark[],
  isUndelete = false
) => {
  if (!bookmarks?.length) return false;

  try {
    const bookmarkIds = bookmarks.map((b) => b.id);

    if (isUndelete) {
      await BookmarkModel.updateMany({ _id: { $in: bookmarkIds } }, { isArchived: false });
      bookmarkStore.archiveBookmarks(bookmarkIds, true);
      return true;
    }

    const [deleted, archived]: Bookmark[][] = splitArray(bookmarks, (b: Bookmark) => b.isArchived);
    const [deletedIds, archivedIds] = [deleted, archived].map((arr) => arr.map((b) => b.id));

    if (archivedIds?.length > 0) {
      await BookmarkModel.updateMany({ _id: { $in: archivedIds } }, { isArchived: true });
      bookmarkStore.archiveBookmarks(archivedIds);
    }

    if (deletedIds?.length > 0) {
      await BookmarkModel.deleteMany({ _id: { $in: deletedIds } });
      await Promise.all(
        deleted.map(
          (bookmark) =>
            bookmarkStore.listByHash(bookmark.imageHash).length === 1 &&
            fs.unlink(bookmark.imagePath)
        )
      );

      bookmarkStore.deleteBookmarks(deletedIds);
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const editBookmarkTags = async (
  bookmarkStore: BookmarkStore,
  bookmarkIds: string[] = [],
  addedTagIds: string[] = [],
  removedTagIds: string[] = []
) => {
  if (!bookmarkIds?.length || (!addedTagIds?.length && !removedTagIds?.length)) return false;

  try {
    const dateModified = dayjs().toISOString();

    if (removedTagIds?.length > 0)
      await BookmarkModel.updateMany(
        { _id: { $in: bookmarkIds } },
        { $pullAll: { tagIds: removedTagIds }, dateModified }
      );

    if (addedTagIds?.length > 0)
      await BookmarkModel.updateMany(
        { _id: { $in: bookmarkIds } },
        { $push: { tagIds: addedTagIds }, dateModified }
      );

    bookmarkStore.editBookmarkTags({
      addedIds: addedTagIds,
      dateModified,
      bookmarkIds,
      removedIds: removedTagIds,
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const getAllBookmarks = async () => {
  try {
    const bookmarks = (await BookmarkModel.find()).map((r) => r.toJSON() as Bookmark);
    return bookmarks;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getBookmarkByHash = async (hash: string) => {
  try {
    const bookmark = (await BookmarkModel.findOne({ hash }))?.toJSON?.() as Bookmark;
    return bookmark;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getBookmarks = async (ids: string[]) => {
  try {
    const bookmarks = (await BookmarkModel.find({ _id: { $in: ids } })).map(
      (r) => r.toJSON() as Bookmark
    );
    return bookmarks;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const RefreshBookmarkQueue = new PromiseQueue();

export const refreshBookmark = async (bookmarkStore: BookmarkStore, id: string) => {
  try {
    const bookmark = bookmarkStore.getById(id);

    const [hash, { mtime }] = await Promise.all([
      md5File(bookmark.imagePath),
      fs.stat(bookmark.imagePath),
    ]);

    const updates: Partial<Bookmark> = {
      dateModified: dayjs(mtime).isAfter(bookmark.dateModified)
        ? mtime.toISOString()
        : bookmark.dateModified,
      imageHash: hash,
    };

    await BookmarkModel.updateOne({ _id: id }, updates);
    bookmark.update(updates);

    return updates;
  } catch (err) {
    console.error(err);
    return null;
  }
};

interface SaveBookmarkProps {
  dbOnly?: boolean;
  imageAsBase64: string;
  tagIds?: string[];
  targetDir: string;
  title: string;
}

interface SaveBookmarkResult {
  bookmark?: Bookmark;
  error?: string;
  isDuplicate?: boolean;
  success: boolean;
}

export const saveBookmark = async ({
  dbOnly = false,
  imageAsBase64,
  tagIds,
  targetDir,
  title,
}: SaveBookmarkProps): Promise<SaveBookmarkResult> => {
  const dateCreated = dayjs().toISOString();

  const { createHash } = await import("crypto");
  const imageHash = createHash("md5").update(imageAsBase64, "base64").digest("hex");

  const dirPath = `${targetDir}\\${imageHash.substring(0, 2)}\\${imageHash.substring(2, 4)}`;
  const newPath = `${dirPath}\\${imageHash}.jpg`;

  try {
    if (!dbOnly && !(await checkFileExists(newPath)))
      await copyFile(dirPath, Buffer.from(imageHash, "base64"), newPath);

    let bookmark = await getBookmarkByHash(imageHash);

    if (!bookmark) {
      bookmark = (
        await BookmarkModel.create({
          dateCreated,
          dateModified: dayjs().toISOString(),
          imageHash,
          isArchived: false,
          path: newPath,
          rating: 0,
          tagIds,
          title,
        })
      ).toJSON();

      return { success: true, bookmark, isDuplicate: false };
    } else {
      return { success: true, bookmark, isDuplicate: true };
    }
  } catch (err) {
    console.log("Error saving bookmark:", err);

    if (err.code === "EEXIST") {
      const bookmark = await getBookmarkByHash(imageHash);

      if (!bookmark) {
        console.log("Bookmark exists, but not in db. Inserting into db only...", {
          dateCreated,
          imageHash,
          newPath,
          tagIds,
          title,
        });

        return await saveBookmark({ dbOnly: true, imageAsBase64, tagIds, targetDir, title });
      }

      return { success: true, bookmark, isDuplicate: true };
    } else {
      return { success: false, error: err?.message };
    }
  }
};

export const setBookmarkRating = async (
  bookmarkStore: BookmarkStore,
  bookmarkIds: string[] = [],
  rating: number
) => {
  try {
    const dateModified = dayjs().toISOString();
    await BookmarkModel.updateMany({ _id: { $in: bookmarkIds } }, { rating, dateModified });
    bookmarkStore.setBookmarkRatings(bookmarkIds, rating, dateModified);
  } catch (err) {
    console.error(err);
  }
};
