import { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { createRootStore, RootStoreContext } from "store";
import { ToastContainer } from "components";
import { Home } from "views";
import "react-toastify/dist/ReactToastify.css";
import "./css/index.css";

export const rootStore = createRootStore();

const darkTheme = createTheme({ palette: { mode: "dark" } });
const muiCache = createCache({ key: "mui", prepend: true });

export const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.debug("App useEffect fired");
    setIsLoading(false);
  }, []);

  return (
    <RootStoreContext.Provider value={rootStore}>
      <CacheProvider value={muiCache}>
        <ThemeProvider theme={darkTheme}>
          {isLoading ? null : <Home />}

          <ToastContainer />
        </ThemeProvider>
      </CacheProvider>
    </RootStoreContext.Provider>
  );
};
