const DEFAULT_PALETTE = [
  // Core colors
  { name: "Black", hex: "#000000" },
  { name: "Gray 1", hex: "#111111" },
  { name: "Gray 2", hex: "#222222" },
  { name: "Gray 3", hex: "#333333" },
  { name: "Gray 4", hex: "#444444" },
  { name: "Gray 5", hex: "#555555" },
  { name: "Gray 6", hex: "#666666" },
  { name: "Gray 7", hex: "#777777" },
  { name: "Gray 8", hex: "#888888" },
  { name: "Gray 9", hex: "#999999" },
  { name: "Gray 10", hex: "#AAAAAA" },
  { name: "Gray 11", hex: "#BBBBBB" },
  { name: "Gray 12", hex: "#CCCCCC" },
  { name: "Gray 13", hex: "#DDDDDD" },
  { name: "Gray 14", hex: "#EEEEEE" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Yellow", hex: "#FFFF00" },

  // Additional colors
  { name: "Orange", hex: "#FFA500" },
  { name: "Purple", hex: "#800080" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Rebecca Purple", hex: "#663399" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Teal", hex: "#008080" },
  { name: "Aquamarine", hex: "#7FFFD4" },
  { name: "Cherry", hex: "#DE3163" },
  { name: "Grass Green", hex: "#009A17" },

];

let colorPaletteHTML;
export async function setup(plugin) {
  colorPaletteHTML = await plugin.resourceLoader().resource("resources/colorpalette.html", "html");
}

export function createPaletteView(plugin, projectOptions) {
  const colorPaletteRoot = colorPaletteHTML.cloneNode(true);

  const paletteView = colorPaletteRoot.querySelector(".palette");
  const colorName = colorPaletteRoot.querySelector(".color-name");

  const colorPalette = DEFAULT_PALETTE.map(color => hexSpecToColor(color));
  let currentColor = null;

  function hexToRgb(hex) {
    return {
      red: parseInt(hex.slice(1, 3), 16),
      green: parseInt(hex.slice(3, 5), 16),
      blue: parseInt(hex.slice(5, 7), 16)
    };
  }

  function hexSpecToColor(colorSpec) {
    const colorView = document.createElement("div");
    colorView.classList.add("color");
    colorView.style.backgroundColor = colorSpec.hex;

    return {
      name: colorSpec.name,
      hex: colorSpec.hex,
      view: colorView,
      ...hexToRgb(colorSpec.hex)
    }
  }

  function extractRgb(color) {
    return {
      red: color.red,
      green: color.green,
      blue: color.blue
    };
  }


  function calculateColorDistance(color1, color2) {
    const redDiff = color1.red - color2.red;
    const greenDiff = color1.green - color2.green;
    const blueDiff = color1.blue - color2.blue;

    return Math.sqrt(redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff);
  }

  function getClosestPaletteColor(targetColor) {
    let closestColor = null;
    let closestDistance = Number.MAX_VALUE;
    for (const color of colorPalette) {
      const distance = calculateColorDistance(targetColor, color);
      if (distance < closestDistance) {
        closestColor = color;
        closestDistance = distance;
      }
    }

    return closestColor;
  }

  colorPaletteRoot.addColorOption = function(color) {
    const colorView = color.view;

    colorView.addEventListener("mouseover", () => {
      colorName.textContent = color.name;
    });
    colorView.addEventListener("click", () => {
      projectOptions.set("brush.color", extractRgb(color));
      watcher.sync();
    });
    colorView.addEventListener("mouseleave", () => {
      colorName.textContent = currentColor == null ? "None" : currentColor.name;
    });

    paletteView.appendChild(colorView);
  }

  for (const color of colorPalette) {
    colorPaletteRoot.addColorOption(color);
  }

  const watcher = projectOptions.createWatcher(plugin);
  watcher.watch("brush.color", value => {
    if (currentColor) {
      currentColor.view.classList.remove("selected");
    }
    if (value == null) {
      currentColor = null;
      colorName.textContent = "None";
      return;
    }
    currentColor = getClosestPaletteColor(value);
    colorName.textContent = currentColor.name;
    currentColor.view.classList.add("selected");
  });

  return colorPaletteRoot;
}