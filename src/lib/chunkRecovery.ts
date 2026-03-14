const CHUNK_RELOAD_GUARD_KEY = "etk:chunk-reload-guard";
const CHUNK_RELOAD_GUARD_TTL_MS = 15_000;

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

function isChunkLoadFailure(error: unknown) {
  const message = getErrorMessage(error);
  if (!message) return false;

  return [
    "ChunkLoadError",
    "Failed to fetch dynamically imported module",
    "Importing a module script failed",
    "error loading dynamically imported module",
  ].some((needle) => message.includes(needle));
}

function shouldReloadForChunkError() {
  try {
    const raw = sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY);
    if (!raw) return true;

    const parsed = JSON.parse(raw) as { path?: string; ts?: number };
    if (!parsed?.path || typeof parsed.ts !== "number") return true;

    const samePath = parsed.path === window.location.pathname;
    const fresh = Date.now() - parsed.ts < CHUNK_RELOAD_GUARD_TTL_MS;
    return !(samePath && fresh);
  } catch {
    return true;
  }
}

function rememberChunkReload() {
  try {
    sessionStorage.setItem(
      CHUNK_RELOAD_GUARD_KEY,
      JSON.stringify({
        path: window.location.pathname,
        ts: Date.now(),
      })
    );
  } catch {
    // Ignore sessionStorage failures.
  }
}

function showReloadNotice() {
  if (document.getElementById("chunk-reload-notice")) return;

  const notice = document.createElement("div");
  notice.id = "chunk-reload-notice";
  notice.setAttribute("dir", "rtl");
  notice.style.position = "fixed";
  notice.style.inset = "0";
  notice.style.zIndex = "99999";
  notice.style.display = "flex";
  notice.style.alignItems = "center";
  notice.style.justifyContent = "center";
  notice.style.background = "rgba(15, 23, 42, 0.2)";
  notice.style.backdropFilter = "blur(4px)";
  notice.innerHTML = `
    <div style="
      width:min(92vw, 420px);
      background:#fff;
      border:1px solid rgba(226,232,240,1);
      border-radius:20px;
      box-shadow:0 20px 50px rgba(15,23,42,0.18);
      padding:20px 22px;
      text-align:center;
      font-family:inherit;
    ">
      <div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:8px;">
        تم تحديث المتجر
      </div>
      <div style="font-size:14px;line-height:1.7;color:#475569;">
        جارٍ إعادة تحميل الصفحة تلقائيًا لضمان تشغيل أحدث نسخة بدون أخطاء.
      </div>
    </div>
  `;

  document.body.appendChild(notice);
}

function recoverFromChunkError(error: unknown) {
  if (!isChunkLoadFailure(error) || !shouldReloadForChunkError()) {
    return;
  }

  rememberChunkReload();
  showReloadNotice();

  window.setTimeout(() => {
    window.location.reload();
  }, 900);
}

export function handleChunkRecovery(error: unknown) {
  recoverFromChunkError(error);
}

export function installChunkRecovery() {
  window.addEventListener("error", (event) => {
    recoverFromChunkError(event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    recoverFromChunkError(event.reason);
  });
}
