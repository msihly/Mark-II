import * as dotenv from "dotenv";
dotenv.config();
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { App } from "./app";

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);
