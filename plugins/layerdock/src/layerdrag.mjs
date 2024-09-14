export function createDragState(options) {
  return {
    dragLayer: null,
    dragGroup: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    previewDiv: null,
    ...options
  };
}

export function connectLayerDrag(layer, layerGroup, layerDiv, dragState) {
  /*function setupLayerMove(e) {
    dragState.dragLayer = layer;
    dragState.dragGroup = layerGroup;
    dragState.dragOffsetX = e.clientX - layerDiv.getBoundingClientRect().left;
    dragState.dragOffsetY = e.clientY - layerDiv.getBoundingClientRect().top;

    const previewDiv = layerDiv.cloneNode(true);
    dragState.previewDiv = previewDiv;
    previewDiv.classList.add("layerdock-managed");
    previewDiv.classList.add("dragging");
    previewDiv.style.position = "absolute";
    previewDiv.style.left = e.clientX - dragState.dragOffsetX + "px";
    previewDiv.style.top = e.clientY - dragState.dragOffsetY + "px";
    previewDiv.style.width = layerDiv.offsetWidth + "px";
    document.body.appendChild(previewDiv);
  }

  function onDragLayerMove(e) {
    if (!dragState.dragLayer) {
      setupLayerMove(e);
    }

    if (dragState.dragLayer !== layer) {
      return;
    }

    dragState.previewDiv.style.left = e.clientX - dragState.dragOffsetX + "px";
    dragState.previewDiv.style.top = e.clientY - dragState.dragOffsetY + "px";

    e.preventDefault();
  }
  function onDragLayerRelease(e) {
    setTimeout(() => {
      if (dragState.previewDiv) {
        dragState.dragLayer = null;
        dragState.dragGroup = null;
        document.body.removeChild(dragState.previewDiv);
      }
    }, 0);
    
    document.removeEventListener("mousemove", onDragLayerMove, true);
    document.removeEventListener("mouseup", onDragLayerRelease, true);
  }

  function onLayerMouseDown(e) {
    if (e.button !== 0) return;

    document.addEventListener("mousemove", onDragLayerMove, true);
    document.addEventListener("mouseup", onDragLayerRelease, true);
    e.preventDefault();
  }
  function onLayerMoveOver(e) {
    if (dragState.dragLayer === layer || !dragState.dragLayer) {
      return;
    }

    const rect = layerDiv.getBoundingClientRect();
    const yDiff = e.clientY - rect.top;

    if (yDiff < rect.height / 2) {
      layerDiv.classList.add("drag-over-top");
      layerDiv.classList.remove("drag-over-bottom");
    } else {
      layerDiv.classList.add("drag-over-bottom");
      layerDiv.classList.remove("drag-over-top");
    }
  }
  function onLayerMouseOut() {
    layerDiv.classList.remove("drag-over-top");
    layerDiv.classList.remove("drag-over-bottom");
  }
  function onLayerMouseUp(e) {
    if (dragState.dragLayer && dragState.dragLayer !== layer) {
      dragState.dragGroup.removeLayer(dragState.dragLayer);

      const rect = layerDiv.getBoundingClientRect();
      const yDiff = e.clientY - rect.top;

      if (yDiff < rect.height / 2) {
        layerGroup.insertLayerBefore(dragState.dragLayer, layer);
      } else {
        layerGroup.insertLayerAfter(dragState.dragLayer, layer);
      }

      dragState.redraw();
    }
    layerDiv.classList.remove("drag-over-top");
    layerDiv.classList.remove("drag-over-bottom");
  }

  layerDiv.addEventListener("mousedown", onLayerMouseDown);
  layerDiv.addEventListener("mousemove", onLayerMoveOver);
  layerDiv.addEventListener("mouseout", onLayerMouseOut);
  layerDiv.addEventListener("mouseup", onLayerMouseUp);*/
}