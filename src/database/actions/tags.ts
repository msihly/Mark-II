import { BookmarkModel, Tag, TagModel } from "../models";
import { BookmarkStore, TagStore } from "../../store";
import { dayjs } from "../../utils";

export const createTag = async ({
  aliases = [],
  label,
  parentIds = [],
}: {
  aliases?: string[];
  label: string;
  parentIds?: string[];
}): Promise<{
  error?: string;
  success: boolean;
  tag?: Tag;
}> => {
  try {
    const tag = (await TagModel.create({ aliases, label, parentIds })).toJSON() as Tag;
    // tagStore.createTag(tag);
    return { success: true, tag };
  } catch (err) {
    console.error(err);
    return { success: false, error: err?.message };
  }
};

export const deleteTag = async ({
  bookmarkStore,
  id,
  tagStore,
}: {
  bookmarkStore: BookmarkStore;
  id: string;
  tagStore: TagStore;
}) => {
  try {
    const dateModified = dayjs().toISOString();
    const bookmarkRes = await BookmarkModel.updateMany(
      { tagIds: id },
      { $pull: { tagIds: id }, dateModified }
    );
    if (bookmarkRes?.matchedCount !== bookmarkRes?.modifiedCount)
      throw new Error("Failed to remove tag from all bookmarks");
    bookmarkStore.editBookmarkTags({ dateModified, removedIds: [id] });

    const tagRes = await TagModel.updateMany({ parentIds: id }, { $pull: { parentIds: id } });
    if (tagRes?.matchedCount !== tagRes?.modifiedCount)
      throw new Error("Failed to remove parent tag from all tags");

    await TagModel.deleteOne({ _id: id });
    tagStore.deleteTag(id);

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err?.message };
  }
};

export const editTag = async ({
  aliases,
  id,
  label,
  parentIds,
  tagStore,
}: {
  aliases?: string[];
  id: string;
  label?: string;
  parentIds?: string[];
  tagStore: TagStore;
}) => {
  try {
    await TagModel.updateOne({ _id: id }, { aliases, label, parentIds });
    tagStore.getById(id).update({ aliases, label, parentIds });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const getAllTags = async () => {
  try {
    const tags = (await TagModel.find()).map((r) => r.toJSON() as Tag);
    return tags;
  } catch (err) {
    console.error(err?.message ?? err);
    return [];
  }
};
