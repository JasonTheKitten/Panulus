// TODO: What if window is too small?
export function setupResizeSystem(window) {
  const windowContent = window.querySelector(".content");

  let isMouseDown = false;
  let hasStartedResizing = false;
  
  let startParams = {}
  let currentDirectionMap = {}

  function showDirectionalCursor(directionMap) {
    let vChar = directionMap.top ? "n" : directionMap.bottom ? "s" : "";
    let hChar = directionMap.left ? "w" : directionMap.right ? "e" : "";
    if (vChar === "" && hChar === "") {
      window.style.cursor = "default";
    } else {
      // TODO: Cursor can conflict with window movement
      window.style.cursor = vChar + hChar + "-resize";
    }
  }
  function startResize(e, directionMap) {
    hasStartedResizing = true;
    startParams = {
      x: e.clientX,
      y: e.clientY,
      width: windowContent.offsetWidth,
      height: windowContent.offsetHeight,
      left: window.offsetLeft,
      top: window.offsetTop
    }
    currentDirectionMap = directionMap;

    e.preventDefault();
  }
  function onResize(e) {
    const deltaX = e.clientX - startParams.x;
    const deltaY = e.clientY - startParams.y;

    if (currentDirectionMap.left) {
      windowContent.style.width = `${startParams.width - deltaX}px`;
      window.style.left = `${startParams.left + deltaX}px`;
    }
    if (currentDirectionMap.right) {
      windowContent.style.width = `${startParams.width + deltaX}px`;
    }
    if (currentDirectionMap.top) {
      windowContent.style.height = `${startParams.height - deltaY}px`;
      window.style.top = `${startParams.top + deltaY}px`;
    }
    if (currentDirectionMap.bottom) {
      windowContent.style.height = `${startParams.height + deltaY}px`;
    }

    e.preventDefault();
  }
  function onMouseMove(e) {
    if (e.target.closest(".maximized")) {
      return;
    }

    if (hasStartedResizing) {
      onResize(e);
      return;
    }

    const borderWidth = 5; // A bit larger than the actual value, to make it easier to hit
    const rect = window.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const directionMap = {
      left: mouseX <= borderWidth,
      right: mouseX >= rect.width - borderWidth,
      top: mouseY <= borderWidth,
      bottom: mouseY >= rect.height - borderWidth
    }

    if (isMouseDown) {
      startResize(e, directionMap);
    } else {
      showDirectionalCursor(directionMap);
    }
  }
  window.addEventListener("mousemove", onMouseMove);

  window.addEventListener("mousedown", e => {
    if (e.target.closest(".maximized")) {
      return;
    }

    isMouseDown = true;
    
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      isMouseDown = false;
      hasStartedResizing = false;
    }

    window.removeEventListener("mousemove", onMouseMove);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}