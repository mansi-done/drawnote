import { useState, useEffect } from "react";
import { fabric } from "fabric";


const useFabricZoom = (canvas, currentTool, currentZoom, setCurrentZoom) => {
  //   const dispatch = useDispatch();
  //   const currentZoom = useSelector((state) => state.zoom.value.zoom);
  const [zoom, setZoom] = useState(currentZoom);
  const [curVpt, setCurVpt] = useState(null);
  //   const currentTool = useSelector((state) => state.tool.value.activeTool);
  const [isHandTool, setIsHandTool] = useState(false);

  // useEffect(() => {
  //   if (canvas) {
  //     if (currentTool.slice(0, 4) === "hand") {
  //       setIsHandTool(true);
  //       canvas.defaultCursor = "grab";
  //       canvas.forEachObject(function (obj) {
  //         obj.hoverCursor = "grab";
  //       });
  //     } else {
  //       if (isHandTool) {
  //         setIsHandTool(false);
  //         canvas.defaultCursor = "default";
  //         canvas.forEachObject(function (obj) {
  //           obj.hoverCursor = "default";
  //         });
  //       }
  //     }
  //   }
  // }, [currentTool]);

  // useEffect(() => {
  //   setCurrentZoom(zoom);
  // }, [zoom]);

  useEffect(() => {
    if (currentZoom != zoom) handleSetZoom();
  }, [currentZoom]);

  const handleSetZoom = () => {
    if (!canvas) return;
    setZoom(currentZoom);
    canvas.setZoom(currentZoom);
    canvas.requestRenderAll();
  };

  useEffect(() => {
    if (!canvas) return;
    const handleMouseDown = (opt) => {
      if (currentTool.slice(0, 4) != "hand") {
        return;
      }
      const evt = opt.e;

      if (currentTool == "handrotateview") {
        if (evt.altKey === true || isHandTool) {
          canvas.lastPosX = evt.clientX;
          canvas.angle = 0;
          canvas.isDragging = true;
          canvas.selection = false;
        }
      } else {
        const evt = opt.e;
        canvas.isDragging = false;
        canvas.selection = true;

        if (evt.altKey === true || isHandTool) {
          canvas.isDragging = true;
          canvas.selection = false;
          canvas.lastPosX = evt.clientX;
          canvas.lastPosY = evt.clientY;
        }
      }
    };

    const handleMouseMove = (opt) => {
      if (currentTool.slice(0, 4) != "hand") return;
      var e = opt.e;
      if (currentTool == "handrotateview") {
        if (canvas.lastPosX && canvas.angle != null && canvas.isDragging) {
          if (canvas.lastPosX < e.clientX) canvas.angle = canvas.angle + 1;
          else canvas.angle = canvas.angle - 1;
        }
      } else {
        if (canvas.isDragging) {
          var vpt = canvas.viewportTransform;
          if (vpt && canvas.lastPosX && canvas.lastPosY) {
            vpt[4] += e.clientX - canvas.lastPosX;
            vpt[5] += e.clientY - canvas.lastPosY;
            canvas.requestRenderAll();
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
          }
        }
      }
    };

    const handleMouseUp = (opt) => {
      if (currentTool.slice(0, 4) != "hand") return;

      if (canvas.viewportTransform) {
        canvas.setViewportTransform(canvas.viewportTransform);
      }

      canvas.isDragging = false;
      canvas.selection = true;
    };

    const handleZoomPanPinch = (opt) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      if (opt.e.ctrlKey) {
        // console.log("pinch")
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        // canvas.setZoom(zoom);
        if (zoom > 200) zoom = 200;
        if (zoom < 0.20) zoom = 0.20;
        setZoom(zoom);
        // canvas.getObjects().map((obj: any) => {
        //   if (obj.strokeWidth) {
        //     console.log(obj)
        //     const newStrokeWidth = zoom * obj.strokeWidth;
        //     return obj.set({
        //       strokeWidth: newStrokeWidth
        //     });
        //   }
        //   else return obj
        // })
          const middlePoint = {
            x: opt.e.clientX,
            y: opt.e.clientY,
          };
          // Apply the zoom with the updated dimensions
          canvas.zoomToPoint(middlePoint, zoom);
      } else {
        var e = opt.e;
        var vpt = canvas?.viewportTransform;
        if (vpt) {
          vpt[4] -= e.deltaX;
          vpt[5] -= e.deltaY;
        }
        setCurVpt(vpt);

        canvas.renderAll();
      }
    };

    canvas.on("mouse:wheel", handleZoomPanPinch);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:wheel", handleZoomPanPinch);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, isHandTool, currentTool]);

  return [zoom];
};

export default useFabricZoom;
