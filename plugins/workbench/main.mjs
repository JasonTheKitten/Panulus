import WorkbenchService from "./service.mjs";

const COMBO_COOLDOWN = 100;

export async function setup(plugin) {
  const appRoot = document.getElementById("app");

  const service = new WorkbenchService(plugin);
  plugin.registerService(service);

  plugin.onEachProvider("base.core.workbench.display", {
    provide(_pid, value) {
      appRoot.childNodes.forEach(node => node.remove());
      appRoot.appendChild(value.attach());
    }
  });

  setupKeyCombos(plugin);
}

let lastComboTime = -1;

// Use Date.now() instead of e.timeStamp because there isn't alway a direct event
function setupKeyCombos(plugin) {
  const keyMap = {}
  let ongoingRepeat;
  document.addEventListener("keydown", e => {
    keyMap[e.key] = true;

    if (Date.now() - lastComboTime < COMBO_COOLDOWN && lastComboTime !== -1) {
      return;
    }

    let done = false;
    plugin.onEachProvider("base.core.workbench.keycombo", {
      provide(_pid, combolist) {
        for (const value of combolist) {
          if (!done && compareKeyCombos(value.defaultKeyCombo)) {
            if (value.filter && !value.filter()) {
              return;
            }
            
            if (value.callback == "repeat") {
              value.repeat();
            } else if (value.callback) {
              value.callback();
            }
            e.preventDefault();
            lastComboTime = Date.now();
            done = true;

            if (value.repeat) {
              ongoingRepeat = setTimeout(() => repeatKeyCombo(plugin, value), 500);
            }
          }
        }
      }
    }, true);
  });

  document.addEventListener("keyup", e => {
    if (ongoingRepeat) {
      clearTimeout(ongoingRepeat);
      ongoingRepeat = null;
    }
    keyMap[e.key] = false;
  }, true);

  function repeatKeyCombo(plugin, combo) {
    if (compareKeyCombos(combo.defaultKeyCombo)) {
      if (combo.filter && !combo.filter()) {
        return;
      }
  
      combo.repeat();
      lastComboTime = Date.now();
  
      setTimeout(() => repeatKeyCombo(plugin, combo), 16);
    }
  }

  function compareKeyCombos(keyCombo) {
    if (typeof keyCombo[0] === "object") {
      for (const combo of keyCombo) {
        if (compareKeyCombos(combo)) {
          return true;
        }
      }
      return false;
    }

    for (const key of keyCombo) {
      if (keyMap[key] !== true) {
        return false;
      }
    }

    return true;
  }
}