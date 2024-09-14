const BORDER_WIDTH = 5; // A bit larger than the actual value, to make it easier to hit

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
  function onSelect(e) {
    e.preventDefault();
  }
  function onMouseMove(e, directionMap) {
    if (e.target.closest(".maximized")) {
      return;
    }

    if (hasStartedResizing) {
      onResize(e);
      return;
    }
    
    const isResizing = checkIsResizing(directionMap);
    if (isMouseDown && isResizing) {
      startResize(e, directionMap);
    } else if (!isMouseDown){
      showDirectionalCursor(directionMap);
    }
  }
  
  function generateDirectionMap(e) {
    const rect = window.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const borderWidth = BORDER_WIDTH;
    return {
      left: mouseX <= borderWidth,
      right: mouseX >= rect.width - borderWidth,
      top: mouseY <= borderWidth,
      bottom: mouseY >= rect.height - borderWidth
    }
  }

  function checkIsResizing(directionMap) {
    return directionMap.left || directionMap.right || directionMap.top || directionMap.bottomz;
  }

  const mouseMovePreviewHandler = (e) => {
    const directionMap = generateDirectionMap(e);
    onMouseMove(e, directionMap);
  };
  window.addEventListener("mousemove", mouseMovePreviewHandler);

  window.addEventListener("mousedown", e => {
    if (e.target.closest(".maximized")) {
      return;
    }

    const directionMap = generateDirectionMap(e);
    const mouseMoveHandler = (e) => onMouseMove(e, directionMap);

    isMouseDown = true;
    
    function onMouseUp() {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectstart", onSelect, true);
      window.addEventListener("mousemove", mouseMovePreviewHandler);
      isMouseDown = false;
      hasStartedResizing = false;
    }

    window.removeEventListener("mousemove", mouseMovePreviewHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectstart", onSelect, true);
  });
}