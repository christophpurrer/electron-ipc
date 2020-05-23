// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  replaceText(`chrome-version`, process.versions.chrome);
  replaceText(`node-version`, process.versions.node);
  replaceText(`electron-version`, process.versions.electron);
});
