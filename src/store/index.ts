import { createContext, useContext } from "react";
import { RootStore } from "./root-store";
export const RootStoreContext = createContext<RootStore>({} as RootStore);
export const useStores = () => useContext<RootStore>(RootStoreContext);

export * from "./bookmarks";
export * from "./home";
export * from "./root-store";
export * from "./tags";
