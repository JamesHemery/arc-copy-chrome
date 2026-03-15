chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "copy") {
    const textarea = document.createElement("textarea");
    textarea.value = msg.text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
});
