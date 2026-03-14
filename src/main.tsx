import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { installChunkRecovery } from "./lib/chunkRecovery";
import "./index.css";

installChunkRecovery();

createRoot(document.getElementById("root")!).render(<App />);
