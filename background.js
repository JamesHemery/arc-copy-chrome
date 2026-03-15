const TOAST_FUNC = () => {
  const existing = document.getElementById("__copy-url-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "__copy-url-toast";
  toast.textContent = "URL copied!";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "#323232",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    zIndex: "2147483647",
    opacity: "0",
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = "1"));
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 1500);
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "onboarding.html" });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "copy-url") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => {
          const textarea = document.createElement("textarea");
          textarea.value = url;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        },
        args: [tab.url],
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: TOAST_FUNC,
      });
    } catch {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["CLIPBOARD"],
        justification: "Copy URL to clipboard",
      });
      await chrome.runtime.sendMessage({ type: "copy", text: tab.url });
      await chrome.offscreen.closeDocument();
    }
  }
});
