import { computed } from "mobx";
import { getRootStore, Model, model, modelAction, prop } from "mobx-keystone";
import { RootStore, TagOption } from "store";
import { CONSTANTS, dayjs } from "utils";

const NUMERICAL_ATTRIBUTES = ["duration", "height", "rating", "size", "width"];

export const sortBookmarks = ({ a, b, isSortDesc, sortKey }) => {
  const first = a[sortKey];
  const second = b[sortKey];

  let comparison: number = null;
  if (NUMERICAL_ATTRIBUTES.includes(sortKey)) comparison = second - first;
  else if (["dateCreated", "dateModified"].includes(sortKey))
    comparison = dayjs(second).isBefore(first) ? -1 : 1;
  else comparison = String(second).localeCompare(String(first));

  return isSortDesc ? comparison : comparison * -1;
};

@model("markII/HomeStore")
export class HomeStore extends Model({
  drawerMode: prop<"persistent" | "temporary">("persistent"),
  excludedTags: prop<TagOption[]>(() => []).withSetter(),
  includeDescendants: prop<boolean>(false).withSetter(),
  includeTagged: prop<boolean>(false).withSetter(),
  includeUntagged: prop<boolean>(false).withSetter(),
  includedTags: prop<TagOption[]>(() => []).withSetter(),
  isArchiveOpen: prop<boolean>(false).withSetter(),
  isDrawerOpen: prop<boolean>(true).withSetter(),
  isSortDesc: prop<boolean>(true).withSetter(),
  page: prop<number>(1).withSetter(),
  sortKey: prop<string>("dateModified").withSetter(),
}) {
  @modelAction
  toggleDrawerMode() {
    this.drawerMode = this.drawerMode === "persistent" ? "temporary" : "persistent";
  }

  @computed
  get filteredBookmarks() {
    const excludedTagIds = this.excludedTags.map((t) => t.id);
    const includedTagIds = this.includedTags.map((t) => t.id);

    const { bookmarkStore } = getRootStore<RootStore>(this);

    return bookmarkStore.bookmarks
      .filter((b) => {
        if (this.isArchiveOpen !== b.isArchived) return false;

        const hasTags = b.tagIds?.length > 0;
        if (this.includeTagged && !hasTags) return false;
        if (this.includeUntagged && hasTags) return false;

        const parentTagIds = this.includeDescendants ? b.tagAncestry : [];

        const hasExcluded = excludedTagIds.some((tagId) => b.tagIds.includes(tagId));
        const hasExcludedParent = parentTagIds.some((tagId) => excludedTagIds.includes(tagId));

        const hasIncluded = includedTagIds.every((tagId) => b.tagIds.includes(tagId));
        const hasIncludedParent = parentTagIds.some((tagId) => includedTagIds.includes(tagId));

        return (hasIncluded || hasIncludedParent) && !hasExcluded && !hasExcludedParent;
      })
      .sort((a, b) => sortBookmarks({ a, b, isSortDesc: this.isSortDesc, sortKey: this.sortKey }));
  }

  @computed
  get displayedBookmarks() {
    return this.filteredBookmarks.slice(
      (this.page - 1) * CONSTANTS.BOOKMARK_COUNT,
      this.page * CONSTANTS.BOOKMARK_COUNT
    );
  }
}
