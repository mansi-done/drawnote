import React, { useEffect, useState } from "react";
import { fabric } from "fabric";

const useText = (canvas,currentTool, setCurrentTool) => {
    const [text, setText] = useState();

    useEffect(() => {
        if (canvas) {
            if (currentTool.slice(0, 5) === "text") {
                canvas.isTextTool = true;
                canvas.defaultCursor = "crosshair";
                canvas.forEachObject(function (obj) {
                    obj.hoverCursor = "crosshair";
                });
                canvas.isDragging = false;
                canvas.initialPosX = null;
                canvas.initialPosY = null;
                canvas.canSelectCanvas = true;
                canvas.tool = currentTool;
            } else {
                canvas.isTextTool = false;
            }
        }
    }, [currentTool]);

    useEffect(() => {
        if (!canvas) return;

        const parentBloundingClientRec = document
            .getElementById("parentofcanvas")
            ?.getBoundingClientRect();


        const handleTyping = (text) => {
            console.log("HandleTypingactive")
            text.enterEditing();
            //@ts-ignore
            text.hiddenTextarea.focus();
        }

        const handleMouseDown = (opt) => {
            if (!canvas.isTextTool) return;
            const event = opt.e;
            canvas.isDragging = true;
            var pointer = canvas.getPointer(event.e);
            canvas.initialPosX = pointer.x;
            canvas.initialPosY = pointer.y;

            var text = new fabric.IText('', {
                left: pointer.x,
                top: pointer.y,
                fontSize: 18,
                fontFamily: 'Inter',
                fill: 'black',
                textAlign: "justify-left",
                fontWeight:'normal',
                lineHeight:1,
                charSpacing:1,
                textBackgroundColor:"white",
                // borderColor:"#B27CE6"
                editingBorderColor :"#b27ce6"
            });

            // text.on('mousedown',()=>handleTyping(text));

            canvas.add(text);
            text.enterEditing();
            text?.hiddenTextarea?.focus();
            canvas.setActiveObject(text);
            canvas.renderAll();
            setCurrentTool("move")
        };

        // const handleMouseMove = (opt) => {
        //   if (!canvas.isTextTool) return;
        //   const event = opt.e;
        //   var pointer = canvas.getPointer(event.e);
        //   if (canvas.isDragging) {
        //     canvas.fire('object:scaling', { target: canvas.currObject });
        //     canvas.selectionColor = 'transparent'
        //     if (canvas.tool === "shape") {
        //       canvas.currObject.set({
        //         x2: pointer.x,
        //         y2: pointer.y,
        //       });
        //     } else if (canvas.tool === "shaperect") {
        //       if (canvas.initialPosX && canvas.initialPosY) {
        //         canvas.currObject.set({
        //           width: pointer.x - canvas.initialPosX,
        //           height: pointer.y - canvas.initialPosY,
        //         });
        //       }
        //     } else if (canvas.tool === "shapeellipse") {
        //       if (canvas.initialPosX && canvas.initialPosY) {
        //         const dX = pointer.x - canvas.initialPosX;
        //         const dY = pointer.y - canvas.initialPosY;
        //         if(dX < 0) canvas.currObject.set({originX:"right"})
        //         else  canvas.currObject.set({originX:"left"})
        //         if(dY < 0) canvas.currObject.set({originY:"bottom"});
        //         else  canvas.currObject.set({originY:"top"})
        //         canvas.currObject.set({
        //           rx: Math.abs(dX) / 2,
        //           ry: Math.abs(dY) / 2,
        //         });
        //       }
        //     } else if (canvas.tool === "shapetriangle") {
        //       if (canvas.initialPosX && canvas.initialPosY) {
        //         canvas.currObject.set({
        //           width: pointer.x - canvas.initialPosX,
        //           height: pointer.y - canvas.initialPosY,
        //         });
        //       }
        //     }
        //   }
        //   canvas.renderAll();
        // };

        // const handleMouseUp = (opt) => {
        //   if (!canvas.isTextTool) return;
        //   canvas?.setActiveObject(canvas.currObject)
        //   canvas.renderAll();
        //   canvas.isDragging = false;
        //   canvas.defaultCursor = "default";
        //   canvas.forEachObject(function (obj) {
        //     obj.hoverCursor = "default";
        //   });
        //   dispatch(setActiveTool({ activeTool: "move" }));
        //   setShape(canvas.currObject);
        //   canvas.selectionColor = '#6699ff4f'
        //   canvas.remove(canvas.currObject);
        // };

        canvas.on("mouse:down", handleMouseDown);
        // canvas.on("mouse:move", handleMouseMove);
        // canvas.on("mouse:up", handleMouseUp);

        return () => {
            canvas.off("mouse:down", handleMouseDown);
            //   canvas.off("mouse:move", handleMouseMove);
            //   canvas.off("mouse:up", handleMouseUp);
        };
    }, [canvas]);

    return [text, canvas?.isTextTool];
};

export default useText;