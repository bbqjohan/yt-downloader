import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { DownloadPage } from "./pages/download-page";

function App() {
  return <DownloadPage />;
}

export default App;
