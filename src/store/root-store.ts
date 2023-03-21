import * as remoteDev from "remotedev";
import { connectReduxDevTools, model, Model, prop, registerRootStore } from "mobx-keystone";
import { BookmarkStore } from "./bookmarks";
import { HomeStore } from "./home";
import { TagStore } from "./tags";

@model("markII/RootStore")
export class RootStore extends Model({
  bookmarkStore: prop<BookmarkStore>(),
  homeStore: prop<HomeStore>(),
  tagStore: prop<TagStore>(),
}) {}

export const createRootStore = () => {
  const rootStore = new RootStore({
    bookmarkStore: new BookmarkStore({}),
    homeStore: new HomeStore({}),
    tagStore: new TagStore({}),
  });

  registerRootStore(rootStore);

  // if (import.meta.env.DEV)
  //   connectReduxDevTools(
  //     remoteDev,
  //     remoteDev.connectViaExtension({ name: "RootStore" }),
  //     rootStore
  //   );

  return rootStore;
};
