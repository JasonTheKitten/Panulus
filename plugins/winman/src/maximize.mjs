export function setupMaximizeOption(window) {
  const windowContent = window.querySelector(".content");
  const restoreButton = window.querySelector(".maximize");
  let windowStyleBkp = cloneStyle(window.style)
  let contentStyleBkp = cloneStyle(windowContent.style)
  restoreButton.addEventListener("click", () => {
    if (window.classList.contains("maximized")) {
      window.classList.remove("maximized");
      restoreStyle(window.style, windowStyleBkp);
      restoreStyle(windowContent.style, contentStyleBkp);
    } else {
      window.classList.add("maximized");
      windowStyleBkp = cloneStyle(window.style)
      contentStyleBkp = cloneStyle(windowContent.style)
      restoreStyle(window.style, {});
      restoreStyle(windowContent.style, {});
      
    }
  });
}

function cloneStyle(style) {
  const clone = {}
  for (const key of style) {
    clone[key] = style[key]
  }

  return clone
}

function restoreStyle(style, backup) {
  for (const key of Object.keys(style)) {
    style.removeProperty(key)
  }
  for (const key of Object.keys(backup)) {
    style[key] = backup[key]
  }
}