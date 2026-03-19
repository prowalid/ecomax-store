import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { installChunkRecovery } from "./lib/chunkRecovery";
import { defaultAppearance } from "./hooks/useAppearanceSettings";
import { applyAppearanceCssVars } from "./lib/appearanceCache";
import { syncClientCacheVersion } from "./lib/clientCacheVersion";
import { bootstrapAppearance } from "./lib/bootstrapAppearance";
import "./index.css";

async function start() {
  installChunkRecovery();
  syncClientCacheVersion();

  const initialAppearance = await bootstrapAppearance(defaultAppearance);
  applyAppearanceCssVars(initialAppearance);

  createRoot(document.getElementById("root")!).render(<App />);
}

void start();
