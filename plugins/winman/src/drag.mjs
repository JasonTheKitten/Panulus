export function setupDragSystem(window) {
  const dragHandle = window.querySelector(".header");
  dragHandle.addEventListener("mousedown", e => {
    if (e.target.closest(".controls") || e.target.closest(".maximized")) {
      return;
    }

    let windowX = window.offsetLeft;
    let windowY = window.offsetTop;
    let offsetX = e.clientX;
    let offsetY = e.clientY;

    function onMouseMove(e) {
      const deltaX = e.clientX - offsetX;
      const deltaY = e.clientY - offsetY;

      window.style.left = `${windowX + deltaX}px`;
      window.style.top = `${windowY + deltaY}px`;

      e.preventDefault();
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}