import { computed } from "mobx";
import {
  applySnapshot,
  getRootStore,
  getSnapshot,
  Model,
  model,
  modelAction,
  prop,
} from "mobx-keystone";
import { getTagAncestry, RootStore } from "store";
import { dayjs } from "utils";

@model("markII/Bookmark")
export class Bookmark extends Model({
  dateCreated: prop<string>(),
  dateModified: prop<string>(),
  id: prop<string>(),
  imageHash: prop<string>(),
  imagePath: prop<string>(),
  isArchived: prop<boolean>(),
  isSelected: prop<boolean>(false),
  originalTitle: prop<string>(),
  pageUrl: prop<string>(),
  rating: prop<number>(),
  tagIds: prop<string[]>(null),
  title: prop<string>(),
}) {
  @modelAction
  update(bookmark: Partial<Bookmark>) {
    applySnapshot(this, { ...getSnapshot(this), ...bookmark });
  }

  @modelAction
  updateTags(tagIds: string[], dateModified = dayjs().toISOString()) {
    this.tagIds = tagIds;
    this.dateModified = dateModified;
  }

  @computed
  get tags() {
    const { tagStore } = getRootStore<RootStore>(this);
    return this.tagIds.map((id) => tagStore.getById(id));
  }

  @computed
  get tagAncestry() {
    return [...new Set(getTagAncestry(this.tags))];
  }
}
