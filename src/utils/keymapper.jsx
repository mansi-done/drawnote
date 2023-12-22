import { fabric } from "fabric";
import { useEffect, useState } from "react";

const handleClone = (canvas, objects) => {
  if (objects) {
    objects.map((object) => {
      object?.clone((cloned) => {
        cloned.left = object.left + 5;
        cloned.top = object.top + 5;
        canvas.bringToFront(cloned);
        canvas.clonedObj && canvas.clonedObj.push(cloned);
      });
    });
  } else {
    const activeObjects = canvas.getActiveObjects();
    const activeObjectsClones = [];
    if (activeObjects) {
      activeObjects.map((object) => {
        object.clone((cloned) => {
          cloned.left = object.left + 20;
          cloned.top = object.top + 20;
          activeObjectsClones.push(cloned);
          canvas.clonedObj && canvas.clonedObj.push(cloned);
        });
      });
    }
  }
};

const handlePaste = (canvas, clones) => {
  if (clones) {
    clones.map((object) => {
      canvas.add(object);
    });
  } else if (canvas.clonedObj) {
    canvas.clonedObj.map((object) => {
      canvas.add(object);
    });
  }
  canvas.clonedObj = [];
};

const handleDeleteKeyDown = (canvas) => {
  console.log("delete keydown");
  const isInputFocused =
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement;

  if (!isInputFocused) {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(function (object) {
        canvas.remove(object);
      });
      canvas.discardActiveObject().renderAll();
    }
  }
};

const handleGroupObjects = (canvas) => {
  console.log("Grouping Objects");
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 1) {
    const group = new fabric.Group(activeObjects, {
      originX: "center",
      originY: "center",
    });

    canvas.discardActiveObject();
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.add(group);

    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  }
};

const handleEnterKey = (canvas, tool) => {
  console.log("Enter Key Pressed");
};

const useHandleKeyDown = (canvas, tool, zoom, setCurrentZoom) => {
  const [key, setKey] = useState("key was pressed and mapped");
  const [clonedObj, setClonedObj] = useState([]);
  const [objectBeingCopied, setObjectBeingCopied] = useState(false);

  const size = 20;

  useEffect(() => {
    if (canvas) canvas.clonedObj = [];
  }, [canvas]);

  const isInputFocused =
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement;

  useEffect(() => {
    const handleKeyMapping = (event) => {
      if (canvas && !isInputFocused) {
        if (
          event.keyCode === 46 ||
          event.key == "Delete" ||
          event.keyCode === 8 ||
          event.key == "Backspace"
        ) {
          handleDeleteKeyDown(canvas);
        } else if (event.keyCode === 13) {
          handleEnterKey(canvas, tool);
        } else if ((event.ctrlKey || event.metaKey) && event.key === "g") {
          event.preventDefault();
          handleGroupObjects(canvas);
        } else if (event.ctrlKey || event.metaKey) {
          if (event.key == "c" || event.key == "C") {
            var c = handleClone(canvas);
          } else if (event.key == "v" || event.key == "V") {
            handlePaste(canvas);
          }
        } else if (event.keyCode == 18) {
          if (!canvas.lastObjectOver) return;
          handleClone(canvas, [canvas.lastObjectOver]);
          canvas.renderAll();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (!canvas) return;
      if (e.keyCode == 18) {
        canvas.lastObjectOver.hoverCursor = "default";
        canvas.renderAll();
      }
    };

    const handleSelection = (e) => {
      if (e?.e?.altKey) {
        var clones = handleClone(canvas);
        handlePaste(canvas);
      }
    };

    const handleMouseOver = (e) => {
      canvas.lastObjectOver = e.target;
    };

    const handleMouseOut = (e) => {
      canvas.lastObjectOver = null;
    };

    const handleMoving = (e) => {
      if (e?.e?.altKey && canvas.clonedObj.length > 0) {
        handlePaste(canvas);
      }
    };

    const handleMouseDown = (e) => {
      if (e?.e?.altKey) {
        handlePaste(canvas);
      }
    };

    document.addEventListener("keydown", handleKeyMapping);
    // document.addEventListener("keyup", handleKeyUp);

    canvas?.on("mouse:down", handleMouseDown);

    // canvas?.on("selection:created", handleSelection)
    canvas?.on("mouse:over", handleMouseOver);
    canvas?.on("mouse:out", handleMouseOut);

    canvas?.on("object:moving", handleMoving);

    return () => {
      document.removeEventListener("keydown", handleKeyMapping);
      // document.addEventListener("keyup", handleKeyUp);

      canvas?.off("mouse:down", handleMouseDown);
      // canvas?.off("selection:created", handleSelection)
      canvas?.off("mouse:over", handleMouseOver);
      canvas?.off("mouse:out", handleMouseOut);

      canvas?.off("object:moving", handleMoving);
    };
  }, [canvas, document]);

  return [key];
};

export default useHandleKeyDown;
